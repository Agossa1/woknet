import Logger from "../../infra/logger/winston";
import { Course, CourseCardData, CourseCategory, CourseChapter, CourseEnrollment, CourseLesson, CourseReview, IDatabase } from "./learnings.types";

export class LearningsRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger,
    ) { }

    async createCourse(courseData: Partial<Course>): Promise<Course | null> {
        try {
            const sql = `
                INSERT INTO courses (
                    title, slug, description, thumbnail_url, 
                    price, currency, level, category_id, status, author_id,
                    learning_objectives, requirements, target_audience, long_description
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING *`;

            const values = [
                courseData.title,
                courseData.slug || courseData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                courseData.description || null,
                courseData.thumbnail_url || null,
                courseData.price || 0,
                courseData.currency || 'EUR',
                courseData.level || 'BEGINNER',
                courseData.category_id || null,
                courseData.status || 'DRAFT',
                courseData.author_id,
                courseData.learning_objectives || [],
                courseData.requirements || [],
                courseData.target_audience || [],
                courseData.long_description || null
            ];

            const result = await this.db.query(sql, values) as any[];
            const row = result[0];

            return row ? (row as Course) : null;

        } catch (error: any) {
            // On log l'erreur avec le contexte (slug) pour faciliter le debug
            this.logger.instance.error("LearningsRepository.createCourse failed", {
                error: error.message,
                slug: courseData.slug
            });

            // On propage l'erreur pour que le controlleur puisse renvoyer le bon code HTTP
            throw new Error(`Erreur lors de la création de la formation : ${error.message}`);
        }
    }

    async getCourseBySlug(slug: string): Promise<Course | null> {
        try {
            const sql = `
                SELECT 
                    c.*, 
                    cc.name as category,
                    json_build_object('full_name', u.full_name, 'avatar_url', p.avatar_url) as author,
                    (
                        SELECT json_agg(ch.* ORDER BY ch.sort_order)
                        FROM course_chapters ch
                        WHERE ch.course_id = c.id
                    ) as chapters
                FROM courses c
                LEFT JOIN users u ON c.author_id = u.id
                LEFT JOIN profiles p ON u.id = p.user_id
                LEFT JOIN course_categories cc ON c.category_id = cc.id
                WHERE c.slug = $1`;

            const result = await this.db.query(sql, [slug]) as any[];
            return result[0] || null;
        } catch (error: any) {
            this.logger.instance.error("LearningsRepository.getCourseBySlug failed", { error: error.message, slug });
            return null;
        }
    }

    async getCourseById(id: string): Promise<Course | null> {
        try {
            const sql = `
                SELECT 
                    c.*, 
                    cc.name as category,
                    json_build_object('full_name', u.full_name, 'avatar_url', p.avatar_url) as author,
                    (
                        SELECT json_agg(ch.* ORDER BY ch.sort_order)
                        FROM course_chapters ch
                        WHERE ch.course_id = c.id
                    ) as chapters
                FROM courses c
                LEFT JOIN users u ON c.author_id = u.id
                LEFT JOIN profiles p ON u.id = p.user_id
                LEFT JOIN course_categories cc ON c.category_id = cc.id
                WHERE c.id = $1::uuid`;

            const result = await this.db.query(sql, [id]) as any[];
            return result[0] || null;
        } catch (error: any) {
            this.logger.instance.error("LearningsRepository.getCourseById failed", { error: error.message, id });
            return null;
        }
    }

    async updateCourse(id: string, courseData: Partial<Course>): Promise<Course | null> {
        try {
            const updates: string[] = [];
            const values: any[] = [];
            let i = 1;

            const fields = [
                'title', 'slug', 'description', 'thumbnail_url',
                'price', 'currency', 'level', 'category_id', 'status',
                'learning_objectives', 'requirements', 'target_audience', 'long_description'
            ];

            for (const field of fields) {
                if (courseData[field as keyof Course] !== undefined) {
                    updates.push(`${field} = $${i++}`);
                    values.push(courseData[field as keyof Course]);
                }
            }

            if (updates.length === 0) return this.getCourseById(id);

            values.push(id);
            const sql = `UPDATE courses SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`;
            const result = await this.db.query(sql, values) as any[];
            return result[0] || null;

        } catch (error: any) {
            this.logger.instance.error("LearningsRepository.updateCourse failed", { error: error.message, id });
            throw new Error(`Erreur lors de la mise à jour de la formation : ${error.message}`);
        }
    }
    async createChapter(chapter: Partial<CourseChapter>): Promise<CourseChapter> {
        try {
            const sql = `
                INSERT INTO course_chapters (course_id, title, sort_order)
                VALUES ($1, $2, $3)
                RETURNING *`;

            const values = [chapter.course_id, chapter.title, chapter.sort_order];
            const result = await this.db.query(sql, values) as any[];
            return result[0] as CourseChapter;
        } catch (error: any) {
            this.logger.instance.error("Error creating chapter", { error: error.message, course_id: chapter.course_id });
            throw new Error(`Failed to create chapter: ${error.message}`);
        }
    }

    async getChaptersByCourseId(courseId: string): Promise<CourseChapter[]> {
        const sql = `
            SELECT ch.*, 
            (
                SELECT json_agg(l.* ORDER BY l.sort_order ASC)
                FROM course_lessons l
                WHERE l.chapter_id = ch.id
            ) as lessons
            FROM course_chapters ch 
            WHERE ch.course_id = $1::uuid 
            ORDER BY ch.sort_order ASC`;
        const result = await this.db.query(sql, [courseId]) as any[];
        return result;
    }
    async createLesson(lesson: Partial<CourseLesson>): Promise<CourseLesson> {
        try {
            const sql = `
                INSERT INTO course_lessons (
                    chapter_id, title, content_type, video_url, 
                    content_text, attachments, duration_minutes, is_free_preview, sort_order
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *`;

            const values = [
                lesson.chapter_id, lesson.title, lesson.content_type,
                lesson.video_url, lesson.content_text,
                JSON.stringify(lesson.attachments || []),
                lesson.duration_minutes, lesson.is_free_preview, lesson.sort_order
            ];

            const result = await this.db.query(sql, values) as any[];
            return result[0] as CourseLesson;
        } catch (error: any) {
            this.logger.instance.error("Error creating lesson", { error: error.message, chapter_id: lesson.chapter_id });
            throw new Error(`Failed to create lesson: ${error.message}`);
        }
    }

    async updateLesson(id: string, lessonData: Partial<CourseLesson>): Promise<CourseLesson | null> {
        try {
            const updates: string[] = [];
            const values: any[] = [];
            let i = 1;

            const fields = [
                'title', 'content_type', 'video_url', 'content_text',
                'attachments', 'duration_minutes', 'is_free_preview', 'sort_order'
            ];

            for (const field of fields) {
                if (lessonData[field as keyof CourseLesson] !== undefined) {
                    updates.push(`${field} = $${i++}`);
                    const val = lessonData[field as keyof CourseLesson];
                    values.push(field === 'attachments' ? JSON.stringify(val) : val);
                }
            }

            if (updates.length === 0) return null;

            values.push(id);
            const sql = `UPDATE course_lessons SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`;
            const result = await this.db.query(sql, values) as any[];
            return result[0] || null;
        } catch (error: any) {
            this.logger.instance.error("Error updating lesson", { id, error: error.message });
            throw new Error(`Failed to update lesson: ${error.message}`);
        }
    }

    /**
     * Récupère les leçons d'un chapitre avec le statut "is_completed" pour un utilisateur
     */
    async getLessonsByChapterWithProgress(chapterId: string, userId: string): Promise<CourseLesson[]> {
        const sql = `
            SELECT l.*, 
            EXISTS (
                SELECT 1 FROM lesson_progress lp 
                WHERE lp.lesson_id = l.id AND lp.user_id = $2
            ) as is_completed
            FROM course_lessons l
            WHERE l.chapter_id = $1
            ORDER BY l.sort_order ASC`;

        const result = await this.db.query(sql, [chapterId, userId]) as any[];
        return result;
    }

    /**
     * Marque une leçon comme terminée
     */
    async markAsCompleted(lessonId: string, userId: string): Promise<void> {
        const sql = `
            INSERT INTO lesson_progress (user_id, lesson_id) 
            VALUES ($1, $2) 
            ON CONFLICT (user_id, lesson_id) DO NOTHING`;
        await this.db.query(sql, [userId, lessonId]);
    }
    async enrollUser(data: Partial<CourseEnrollment>): Promise<CourseEnrollment> {
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

            const result = await this.db.query(sql, values) as any[];
            return result[0] as CourseEnrollment;
        } catch (error: any) {
            this.logger.instance.error("Enrollment failed", { error: error.message, user_id: data.user_id });
            throw new Error("Impossible de finaliser l'inscription au cours.");
        }
    }

    /**
     * Récupère les cours achetés par un utilisateur (pour le Dashboard)
     */
    async getUserDashboard(userId: string): Promise<CourseEnrollment[]> {
        const sql = `
            SELECT ce.*, 
                   row_to_json(c.*) as course
            FROM course_enrollments ce
            JOIN courses c ON ce.course_id = c.id
            WHERE ce.user_id = $1
            ORDER BY ce.enrolled_at DESC`;

        const result = await this.db.query(sql, [userId]) as any[];
        return result;
    }

    /**
     * Met à jour le pourcentage de progression
     */
    async updateProgress(courseId: string, userId: string): Promise<void> {
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
    async addReview(review: Partial<CourseReview>): Promise<CourseReview> {
        try {
            const sql = `
                INSERT INTO course_reviews (course_id, user_id, rating, comment)
                VALUES ($1, $2, $3, $4)
                RETURNING *`;

            const values = [review.course_id, review.user_id, review.rating, review.comment];
            const result = await this.db.query(sql, values) as any[];
            return result[0] as CourseReview;
        } catch (error: any) {
            this.logger.instance.error("Error adding review", { error: error.message });
            throw new Error("Vous avez déjà noté cette formation ou une erreur est survenue.");
        }
    }

    /**
     * Récupère les avis d'un cours avec les noms des utilisateurs
     */
    async getCourseReviews(courseId: string): Promise<CourseReview[]> {
        const sql = `
            SELECT cr.*, u.full_name as user_name
            FROM course_reviews cr
            JOIN users u ON cr.user_id = u.id
            WHERE cr.course_id = $1
            ORDER BY cr.created_at DESC`;

        const result = await this.db.query(sql, [courseId]) as any[];
        return result;
    }

    /**
     * Récupère les cours d'un formateur avec leurs statistiques
     */
    async getInstructorDashboard(authorId: string): Promise<any[]> {
        try {
            const sql = `
                SELECT
                    c.id, c.title, c.slug, c.thumbnail_url, c.price, c.level,
                    cc.name as category, c.status, c.created_at,
                    COUNT(DISTINCT ce.id)::INT as total_students,
                    COALESCE(SUM(ce.amount_paid), 0)::FLOAT as total_revenue,
                    COALESCE(AVG(cr.rating), 0)::FLOAT as avg_rating,
                    COUNT(DISTINCT cr.id)::INT as review_count,
                    COUNT(DISTINCT ch.id)::INT as chapter_count
                FROM courses c
                LEFT JOIN course_categories cc ON c.category_id = cc.id
                LEFT JOIN course_enrollments ce ON c.id = ce.course_id AND ce.payment_status = 'COMPLETED'
                LEFT JOIN course_reviews cr ON c.id = cr.course_id
                LEFT JOIN course_chapters ch ON c.id = ch.course_id
                WHERE c.author_id = $1::uuid
                GROUP BY c.id, cc.name
                ORDER BY c.created_at DESC
            `;
            const result = await this.db.query(sql, [authorId]) as any[];
            return result;
        } catch (error) {
            this.logger.instance.error("Failed to fetch instructor dashboard", { authorId, error });
            return [];
        }
    }

    async getMarketplaceCourses(filters: { category?: string; level?: string }): Promise<CourseCardData[]> {
        try {
            let whereClause = "WHERE c.status = 'PUBLISHED'";
            const params: any[] = [];

            if (filters.category) {
                params.push(filters.category);
                whereClause += ` AND cc.name = $${params.length}`;
            }

            if (filters.level) {
                params.push(filters.level);
                whereClause += ` AND c.level = $${params.length}`;
            }

            const sql = `
                SELECT
                    c.id, c.title, c.slug, c.thumbnail_url, c.price, c.level, cc.name as category,
                    u.full_name as author_name,
                    COALESCE(AVG(cr.rating), 0)::FLOAT as rating_avg,
                    COUNT(DISTINCT ce.id)::INT as enrollments_count
                FROM courses c
                JOIN users u ON c.author_id = u.id
                LEFT JOIN course_categories cc ON c.category_id = cc.id
                LEFT JOIN course_reviews cr ON c.id = cr.course_id
                LEFT JOIN course_enrollments ce ON c.id = ce.course_id
                ${whereClause}
                GROUP BY c.id, u.full_name, cc.name
                ORDER BY c.created_at DESC
            `;
            const result = await this.db.query(sql, params) as any[];
            return result;
        } catch (error) {
            this.logger.instance.error("Failed to fetch marketplace courses", { error });
            return [];
        }
    }

    async isInstructor(userId: string): Promise<boolean> {
        try {
            const sql = `SELECT is_instructor FROM users WHERE id = $1`;
            const result = await this.db.query(sql, [userId]) as any[];
            return result[0]?.is_instructor === true;
        } catch (error) {
            this.logger.instance.error("Failed to check instructor status", { userId, error });
            return false;
        }
    }

    async becomeInstructor(userId: string, data: { headline?: string; bio?: string }): Promise<void> {
        try {
            // 1. Set is_instructor flag + headline on users table
            const updateUserSql = `
                UPDATE users
                SET is_instructor = TRUE,
                    headline = COALESCE($2, headline)
                WHERE id = $1
            `;
            await this.db.query(updateUserSql, [userId, data.headline ?? null]);

            // 2. Update bio on profiles if provided (best-effort, no rollback needed)
            if (data.bio) {
                const updateProfileSql = `
                    UPDATE profiles
                    SET bio = $2
                    WHERE user_id = $1
                `;
                await this.db.query(updateProfileSql, [userId, data.bio]);
            }
        } catch (error: any) {
            this.logger.instance.error("Failed to register as instructor", {
                userId,
                message: error?.message,
                detail: error?.detail,
                code: error?.code,
            });
            throw new Error("Impossible de devenir formateur.");
        }
    }

    async getCourseCategories(): Promise<CourseCategory[]> {
        const sql = `SELECT * FROM course_categories ORDER BY name ASC`;
        return this.db.query(sql);
    }
}