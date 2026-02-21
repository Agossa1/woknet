"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configDB_1 = require("../../config/databases/configDB");
async function seedFormations() {
    try {
        console.log('🌱 Début du seeding des formations...');
        // 1. Récupérer un utilisateur existant pour être l'auteur
        const userResult = await configDB_1.pool.query(`SELECT id FROM users LIMIT 1;`);
        if (userResult.rows.length === 0) {
            console.error('Aucun utilisateur trouvé en base de données pour être défini comme auteur.');
            process.exit(1);
        }
        const authorId = userResult.rows[0].id;
        console.log(`👤 Auteur sélectionné : ${authorId}`);
        // 2. Insérer les formations
        const courses = [
            {
                title: 'Masterclass UI Design: De Zéro à Pro',
                slug: 'masterclass-ui',
                description: 'Apprenez à créer des interfaces modernes, minimalistes et performantes avec Figma.',
                thumbnail_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop',
                price: 89.00,
                level: 'BEGINNER',
                category: 'Design',
                status: 'PUBLISHED'
            },
            {
                title: 'Stratégies Growth Marketing B2B',
                slug: 'growth-marketing',
                description: 'Scalez votre acquisition grâce aux méthodes modernes d\'outbound et de contenu.',
                thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000&auto=format&fit=crop',
                price: 149.00,
                level: 'INTERMEDIATE',
                category: 'Marketing',
                status: 'PUBLISHED'
            },
            {
                title: 'React.js Avancé & Architecture',
                slug: 'react-advanced',
                description: 'Comprendre les patterns avancés, l\'optimisation des performances et la gestion d\'état.',
                thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2000&auto=format&fit=crop',
                price: 129.00,
                level: 'ADVANCED',
                category: 'Développement',
                status: 'PUBLISHED'
            }
        ];
        for (const course of courses) {
            // 3. Insérer dans la table courses
            const courseResult = await configDB_1.pool.query(`INSERT INTO courses (author_id, title, slug, description, thumbnail_url, price, level, category, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (slug) DO NOTHING
         RETURNING id;`, [authorId, course.title, course.slug, course.description, course.thumbnail_url, course.price, course.level, course.category, course.status]);
            let courseId;
            if (courseResult.rows.length === 0) {
                // Le cours existe déjà
                const existing = await configDB_1.pool.query(`SELECT id FROM courses WHERE slug = $1`, [course.slug]);
                courseId = existing.rows[0].id;
                console.log(`⏩ Formation existante : ${course.title}`);
            }
            else {
                courseId = courseResult.rows[0].id;
                console.log(`✅ Formation ajoutée : ${course.title} (${courseId})`);
                // 4. Insérer des chapitres de démo
                const chapters = ['Module 1: Les Fondamentaux', 'Module 2: Outils et Workflow', 'Module 3: Projet Pratique', 'Module 4: Optimisations'];
                for (let i = 0; i < chapters.length; i++) {
                    const chapterResult = await configDB_1.pool.query(`INSERT INTO course_chapters (course_id, title, sort_order) VALUES ($1, $2, $3) RETURNING id;`, [courseId, chapters[i], i + 1]);
                    const chapterId = chapterResult.rows[0].id;
                    // 5. Insérer quelques leçons dans chaque chapitre
                    const numLessons = i === 0 ? 3 : (i === 1 ? 5 : 2);
                    for (let j = 0; j < numLessons; j++) {
                        await configDB_1.pool.query(`INSERT INTO course_lessons (chapter_id, title, content_type, video_url, duration_minutes, is_free_preview, sort_order)
               VALUES ($1, $2, $3, $4, $5, $6, $7);`, [chapterId, `Leçon ${j + 1}`, 'VIDEO', 'https://www.w3schools.com/html/mov_bbb.mp4', Math.floor(Math.random() * 20) + 5, j === 0 && i === 0, j + 1]);
                    }
                }
            }
        }
        console.log('🎉 Seeding terminé avec succès !');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Erreur lors du seeding :', error);
        process.exit(1);
    }
}
seedFormations();
//# sourceMappingURL=seed-formations.js.map