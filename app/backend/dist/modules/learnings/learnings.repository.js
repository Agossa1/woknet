"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningsRepository = void 0;
class LearningsRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async createCourse(courseData) {
        try {
            // On inclut tous les champs requis par l'interface SQL/Type
            const sql = `
                INSERT INTO courses (
                    id, title, slug, description, thumbnail_url, 
                    price, currency, level, category, status, author_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *`;
            const values = [
                courseData.id,
                courseData.title,
                courseData.slug,
                courseData.description,
                courseData.thumbnail_url,
                courseData.price,
                courseData.currency || 'EUR', // Valeur par défaut si non fournie
                courseData.level,
                courseData.category,
                courseData.status || 'DRAFT',
                courseData.author_id
            ];
            const result = await this.db.query(sql, values);
            // On s'assure de récupérer la première ligne retournée
            const row = result[0];
            if (!row) {
                return null;
            }
            // On retourne l'objet mappé au type Course
            return row;
        }
        catch (error) {
            // On log l'erreur avec le contexte (slug) pour faciliter le debug
            this.logger.instance.error("LearningsRepository.createCourse failed", {
                error: error.message,
                slug: courseData.slug
            });
            // On propage l'erreur pour que le controlleur puisse renvoyer le bon code HTTP
            throw new Error(`Erreur lors de la création de la formation : ${error.message}`);
        }
    }
    async getCourseBySlug(slug) {
        try {
            const sql = `
            SELECT c.*, 
            json_agg(DISTINCT ch.* ORDER BY ch.sort_order) as chapters
            FROM courses c
            LEFT JOIN course_chapters ch ON c.id = ch.course_id
            WHERE c.slug = $1
            GROUP BY c.id`;
            const result = await this.db.query(sql, [slug]);
            return result[0] || null;
        }
        catch (error) {
            this.logger.instance.error("Failed to fetch course by slug", { slug });
            return null;
        }
    }
    async createChapter(chapter) {
        try {
            const sql = `
                INSERT INTO course_chapters (course_id, title, sort_order)
                VALUES ($1, $2, $3)
                RETURNING *`;
            const values = [chapter.course_id, chapter.title, chapter.sort_order];
            const result = await this.db.query(sql, values);
            return result[0];
        }
        catch (error) {
            this.logger.instance.error("Error creating chapter", { error: error.message, course_id: chapter.course_id });
            throw new Error(`Failed to create chapter: ${error.message}`);
        }
    }
    async getChaptersByCourseId(courseId) {
        const sql = `SELECT * FROM course_chapters WHERE course_id = $1 ORDER BY sort_order ASC`;
        const result = await this.db.query(sql, [courseId]);
        return result;
    }
    async createLesson(lesson) {
        try {
            const sql = `
                INSERT INTO course_lessons (
                    chapter_id, title, content_type, video_url, 
                    content_text, duration_minutes, is_free_preview, sort_order
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *`;
            const values = [
                lesson.chapter_id, lesson.title, lesson.content_type,
                lesson.video_url, lesson.content_text, lesson.duration_minutes,
                lesson.is_free_preview, lesson.sort_order
            ];
            const result = await this.db.query(sql, values);
            return result[0];
        }
        catch (error) {
            this.logger.instance.error("Error creating lesson", { error: error.message, chapter_id: lesson.chapter_id });
            throw new Error(`Failed to create lesson: ${error.message}`);
        }
    }
    /**
     * Récupère les leçons d'un chapitre avec le statut "is_completed" pour un utilisateur
     */
    async getLessonsByChapterWithProgress(chapterId, userId) {
        const sql = `
            SELECT l.*, 
            EXISTS (
                SELECT 1 FROM lesson_progress lp 
                WHERE lp.lesson_id = l.id AND lp.user_id = $2
            ) as is_completed
            FROM course_lessons l
            WHERE l.chapter_id = $1
            ORDER BY l.sort_order ASC`;
        const result = await this.db.query(sql, [chapterId, userId]);
        return result;
    }
    /**
     * Marque une leçon comme terminée
     */
    async markAsCompleted(lessonId, userId) {
        const sql = `
            INSERT INTO lesson_progress (user_id, lesson_id) 
            VALUES ($1, $2) 
            ON CONFLICT (user_id, lesson_id) DO NOTHING`;
        await this.db.query(sql, [userId, lessonId]);
    }
    async enrollUser(data) {
        try {
            const sql = `
                INSERT INTO course_enrollments (
                    course_id, user_id, amount_paid, payment_status, stripe_session_id
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING *`;
            const values = [
                data.course_id,
                data.user_id,
                data.amount_paid,
                data.payment_status || 'COMPLETED',
                data.stripe_session_id
            ];
            const result = await this.db.query(sql, values);
            return result[0];
        }
        catch (error) {
            this.logger.instance.error("Enrollment failed", { error: error.message, user_id: data.user_id });
            throw new Error("Impossible de finaliser l'inscription au cours.");
        }
    }
    /**
     * Récupère les cours achetés par un utilisateur (pour le Dashboard)
     */
    async getUserDashboard(userId) {
        const sql = `
            SELECT ce.*, 
                   row_to_json(c.*) as course
            FROM course_enrollments ce
            JOIN courses c ON ce.course_id = c.id
            WHERE ce.user_id = $1
            ORDER BY ce.enrolled_at DESC`;
        const result = await this.db.query(sql, [userId]);
        return result;
    }
    /**
     * Met à jour le pourcentage de progression
     */
    async updateProgress(courseId, userId) {
        // Cette requête calcule le % basé sur les leçons terminées vs total
        const sql = `
            UPDATE course_enrollments
            SET progress_percentage = (
                SELECT (COUNT(lp.lesson_id) * 100 / COUNT(l.id))
                FROM course_lessons l
                JOIN course_chapters ch ON l.chapter_id = ch.id
                LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = $2
                WHERE ch.course_id = $1
            )
            WHERE course_id = $1 AND user_id = $2`;
        await this.db.query(sql, [courseId, userId]);
    }
    /**
     * Ajoute un avis (Vérifie la contrainte d'unicité via SQL)
     */
    async addReview(review) {
        try {
            const sql = `
                INSERT INTO course_reviews (course_id, user_id, rating, comment)
                VALUES ($1, $2, $3, $4)
                RETURNING *`;
            const values = [review.course_id, review.user_id, review.rating, review.comment];
            const result = await this.db.query(sql, values);
            return result[0];
        }
        catch (error) {
            this.logger.instance.error("Error adding review", { error: error.message });
            throw new Error("Vous avez déjà noté cette formation ou une erreur est survenue.");
        }
    }
    /**
     * Récupère les avis d'un cours avec les noms des utilisateurs
     */
    async getCourseReviews(courseId) {
        const sql = `
            SELECT cr.*, u.full_name as user_name
            FROM course_reviews cr
            JOIN users u ON cr.user_id = u.id
            WHERE cr.course_id = $1
            ORDER BY cr.created_at DESC`;
        const result = await this.db.query(sql, [courseId]);
        return result;
    }
    /**
     * Récupère les cours d'un formateur avec leurs statistiques
     */
    async getInstructorDashboard(authorId) {
        try {
            const sql = `
                SELECT
                    c.id, c.title, c.slug, c.thumbnail_url, c.price, c.level,
                    c.category, c.status, c.created_at,
                    COUNT(DISTINCT ce.id)::INT as total_students,
                    COALESCE(SUM(ce.amount_paid), 0)::FLOAT as total_revenue,
                    COALESCE(AVG(cr.rating), 0)::FLOAT as avg_rating,
                    COUNT(DISTINCT cr.id)::INT as review_count,
                    COUNT(DISTINCT ch.id)::INT as chapter_count
                FROM courses c
                LEFT JOIN course_enrollments ce ON c.id = ce.course_id AND ce.payment_status = 'COMPLETED'
                LEFT JOIN course_reviews cr ON c.id = cr.course_id
                LEFT JOIN course_chapters ch ON c.id = ch.course_id
                WHERE c.author_id = $1
                GROUP BY c.id
                ORDER BY c.created_at DESC
            `;
            const result = await this.db.query(sql, [authorId]);
            return result;
        }
        catch (error) {
            this.logger.instance.error("Failed to fetch instructor dashboard", { authorId, error });
            return [];
        }
    }
    async getMarketplaceCourses(filters) {
        try {
            let whereClause = "WHERE c.status = 'PUBLISHED'";
            const params = [];
            if (filters.category) {
                params.push(filters.category);
                whereClause += ` AND c.category = $${params.length}`;
            }
            if (filters.level) {
                params.push(filters.level);
                whereClause += ` AND c.level = $${params.length}`;
            }
            const sql = `
                SELECT
                    c.id, c.title, c.slug, c.thumbnail_url, c.price, c.level, c.category,
                    u.full_name as author_name,
                    COALESCE(AVG(cr.rating), 0)::FLOAT as rating_avg,
                    COUNT(DISTINCT ce.id)::INT as enrollments_count
                FROM courses c
                JOIN users u ON c.author_id = u.id
                LEFT JOIN course_reviews cr ON c.id = cr.course_id
                LEFT JOIN course_enrollments ce ON c.id = ce.course_id
                ${whereClause}
                GROUP BY c.id, u.full_name
                ORDER BY c.created_at DESC
            `;
            const result = await this.db.query(sql, params);
            return result;
        }
        catch (error) {
            this.logger.instance.error("Failed to fetch marketplace courses", { error });
            return [];
        }
    }
}
exports.LearningsRepository = LearningsRepository;
//# sourceMappingURL=learnings.repository.js.map