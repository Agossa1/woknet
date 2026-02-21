"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db = new configDB_1.default();
const COMPANIES = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Tesla', 'Stripe'];
const SCHOOLS = ['MIT', 'Stanford', 'Harvard', 'Berkeley', 'Oxford', 'Cambridge'];
const SKILLS = ['React', 'Node.js', 'Python', 'TypeScript', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'GraphQL'];
const LOCATIONS = ['Paris, France', 'London, UK', 'San Francisco, USA', 'New York, USA', 'Berlin, Germany'];
const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce'];
async function seedRecommendationData() {
    console.log('🌱 Starting recommendation data seeding...\n');
    try {
        await db.connect();
        // 1. Create 20 test users with profiles
        console.log('👥 Creating users and profiles...');
        const users = [];
        const hashedPassword = await bcryptjs_1.default.hash('Test123!', 10);
        for (let i = 1; i <= 20; i++) {
            const email = `testuser${i}@worknet.com`;
            const fullName = `Test User ${i}`;
            // Create user
            const [user] = await db.query(`
                INSERT INTO users (email, password_hash, full_name, is_verified, has_onboarded)
                VALUES ($1, $2, $3, true, true)
                ON CONFLICT (email) DO UPDATE SET 
                    is_verified = true,
                    has_onboarded = true
                RETURNING id
            `, [email, hashedPassword, fullName]);
            if (user) {
                // Create/update profile
                const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
                const industry = INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)];
                await db.query(`
                    INSERT INTO profiles (user_id, headline, location, industry, username)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (user_id) DO UPDATE SET
                        headline = $2,
                        location = $3,
                        industry = $4
                `, [
                    user.id,
                    `${industry} Professional | Innovation Leader`,
                    location,
                    industry,
                    `user${i}`
                ]);
                users.push({ userId: user.id, profileId: user.id, fullName, location, industry });
                console.log(`  ✓ Created ${fullName} (${location})`);
            }
        }
        // 2. Add experiences (jobs)
        console.log('\n💼 Adding work experiences...');
        for (const user of users) {
            const numJobs = Math.floor(Math.random() * 2) + 1; // 1-2 jobs
            for (let j = 0; j < numJobs; j++) {
                const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
                await db.query(`
                    INSERT INTO experiences (profile_id, title, company, location, start_date)
                    VALUES ($1, $2, $3, $4, NOW() - INTERVAL '${j + 1} years')
                    ON CONFLICT DO NOTHING
                `, [user.profileId, `Senior Engineer`, company, user.location]);
            }
        }
        // 3. Add educations
        console.log('🎓 Adding education...');
        for (const user of users) {
            const school = SCHOOLS[Math.floor(Math.random() * SCHOOLS.length)];
            await db.query(`
                INSERT INTO educations (profile_id, school_name, degree, field_of_study, start_year, end_year)
                VALUES ($1, $2, $3, $4, 2015, 2019)
                ON CONFLICT DO NOTHING
            `, [user.profileId, school, 'Bachelor of Science', 'Computer Science']);
        }
        // 4. Add skills
        console.log('🛠️ Adding skills...');
        // First get or create skills
        for (const skillName of SKILLS) {
            await db.query(`
                INSERT INTO skills (name, category)
                VALUES ($1, 'Technical')
                ON CONFLICT (name) DO NOTHING
            `, [skillName]);
        }
        const skillsData = await db.query(`SELECT id, name FROM skills`);
        for (const user of users) {
            // Each user gets 3-5 random skills
            const numSkills = Math.floor(Math.random() * 3) + 3;
            const shuffled = [...skillsData].sort(() => 0.5 - Math.random());
            const selectedSkills = shuffled.slice(0, numSkills);
            for (const skill of selectedSkills) {
                await db.query(`
                    INSERT INTO profile_skills (profile_id, skill_id)
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING
                `, [user.profileId, skill.id]);
            }
        }
        // 5. Create follows (network connections)
        console.log('\n🔗 Creating network connections...');
        for (let i = 0; i < users.length; i++) {
            // Each user follows 3-6 random other users
            const numFollows = Math.floor(Math.random() * 4) + 3;
            const otherUsers = users.filter((_, idx) => idx !== i);
            const shuffled = [...otherUsers].sort(() => 0.5 - Math.random());
            const toFollow = shuffled.slice(0, numFollows);
            for (const target of toFollow) {
                await db.query(`
                    INSERT INTO follows (follower_id, following_id)
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING
                `, [users[i].profileId, target.profileId]);
            }
        }
        // 6. Create some posts
        console.log('📝 Creating posts...');
        const posts = [];
        for (let i = 0; i < users.length; i++) {
            const numPosts = Math.floor(Math.random() * 3) + 1; // 1-3 posts per user
            for (let p = 0; p < numPosts; p++) {
                const [post] = await db.query(`
                    INSERT INTO posts (profile_id, content, type)
                    VALUES ($1, $2, 'TEXT')
                    RETURNING id
                `, [users[i].profileId, `Interesting post about ${SKILLS[Math.floor(Math.random() * SKILLS.length)]} #${i}-${p}`]);
                if (post) {
                    posts.push({ id: post.id, authorId: users[i].profileId });
                }
            }
        }
        // 7. Create likes (similar behavior)
        console.log('❤️ Creating likes...');
        for (const user of users) {
            // Each user likes 5-10 random posts
            const numLikes = Math.floor(Math.random() * 6) + 5;
            const shuffled = [...posts].sort(() => 0.5 - Math.random());
            const toLike = shuffled.slice(0, numLikes);
            for (const post of toLike) {
                if (post.authorId !== user.profileId) { // Don't like own posts
                    await db.query(`
                        INSERT INTO likes (profile_id, post_id)
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [user.profileId, post.id]);
                }
            }
        }
        // 8. Create tracking signals
        console.log('📊 Creating tracking signals...');
        for (let i = 0; i < 50; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomPost = posts[Math.floor(Math.random() * posts.length)];
            const actions = ['VIEW', 'CLICK', 'LIKE', 'COMMENT'];
            const action = actions[Math.floor(Math.random() * actions.length)];
            await db.query(`
                INSERT INTO user_signals (user_id, item_id, item_type, action_type, weight)
                VALUES ($1, $2, 'POST', $3, $4)
            `, [randomUser.userId, randomPost.id, action, Math.random() * 5]);
        }
        console.log('\n✅ Seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - ${users.length} users created`);
        console.log(`   - ${posts.length} posts created`);
        console.log(`   - Network connections established`);
        console.log(`   - Skills, experiences, and educations added`);
        console.log(`   - Likes and tracking signals created`);
        console.log('\n🎯 You can now test the recommendation system!');
    }
    catch (error) {
        console.error('❌ Error seeding data:', error);
        throw error;
    }
    finally {
        await db.close();
    }
}
// Run the seeder
seedRecommendationData().catch(console.error);
//# sourceMappingURL=seed-recommendations.js.map