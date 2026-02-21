"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db = new configDB_1.default();
const COMPANIES = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Tesla', 'Stripe', 'Airbnb', 'Uber'];
const SCHOOLS = ['MIT', 'Stanford', 'Harvard', 'Berkeley', 'Oxford', 'Cambridge', 'ETH Zurich', 'Yale'];
const SKILLS = ['React', 'Node.js', 'Python', 'TypeScript', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'GraphQL', 'Machine Learning', 'DevOps'];
const LOCATIONS = ['Paris, France', 'London, UK', 'San Francisco, USA', 'New York, USA', 'Berlin, Germany', 'Toronto, Canada', 'Tokyo, Japan'];
const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce', 'Consulting', 'Media'];
const JOB_TITLES = ['Senior Engineer', 'Product Manager', 'Tech Lead', 'Software Architect', 'Data Scientist', 'DevOps Engineer', 'Full Stack Developer'];
const FIRST_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Emma', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Martin'];
async function createNewUsers() {
    console.log('🌱 Creating new users for recommendation testing...\n');
    try {
        await db.connect();
        const users = [];
        const hashedPassword = await bcryptjs_1.default.hash('Test123!', 10);
        // Create 15 new users
        console.log('👥 Creating 15 new users with profiles...');
        for (let i = 1; i <= 15; i++) {
            const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
            const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
            const fullName = `${firstName} ${lastName}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@worknet.test`;
            const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`;
            try {
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
                    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
                    const industry = INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)];
                    const bio = `Passionate ${industry} professional with expertise in modern technologies. Love to connect and share knowledge!`;
                    // Create profile with correct schema
                    await db.query(`
                        INSERT INTO profiles (user_id, username, bio, location_name, display_name)
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (user_id) DO UPDATE SET
                            bio = $3,
                            location_name = $4,
                            display_name = $5
                    `, [user.id, username, bio, location, fullName]);
                    users.push({ userId: user.id, fullName, location, industry });
                    console.log(`  ✓ ${fullName} (${location})`);
                }
            }
            catch (err) {
                console.log(`  ⚠️  Could not create user ${i}: ${err.message}`);
            }
        }
        // Add work experiences
        console.log('\n💼 Adding work experiences...');
        let expCount = 0;
        for (const user of users) {
            const numJobs = Math.floor(Math.random() * 2) + 1; // 1-2 jobs
            for (let j = 0; j < numJobs; j++) {
                const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
                const title = JOB_TITLES[Math.floor(Math.random() * JOB_TITLES.length)];
                try {
                    await db.query(`
                        INSERT INTO experiences (profile_id, title, company, location, start_date)
                        VALUES ($1, $2, $3, $4, NOW() - INTERVAL '${j + 1} years')
                    `, [user.userId, title, company, user.location]);
                    expCount++;
                }
                catch (err) {
                    // Ignore
                }
            }
        }
        console.log(`  ✓ Created ${expCount} work experiences`);
        // Add educations
        console.log('🎓 Adding education...');
        let eduCount = 0;
        for (const user of users) {
            const school = SCHOOLS[Math.floor(Math.random() * SCHOOLS.length)];
            try {
                await db.query(`
                    INSERT INTO educations (profile_id, school_name, degree, field_of_study, start_year, end_year)
                    VALUES ($1, $2, $3, $4, 2015, 2019)
                `, [user.userId, school, 'Bachelor of Science', 'Computer Science']);
                eduCount++;
            }
            catch (err) {
                // Ignore
            }
        }
        console.log(`  ✓ Created ${eduCount} education records`);
        // Add skills
        console.log('🛠️  Adding skills...');
        // Ensure skills exist
        for (const skillName of SKILLS) {
            await db.query(`
                INSERT INTO skills (name, category)
                VALUES ($1, 'Technical')
                ON CONFLICT (name) DO NOTHING
            `, [skillName]);
        }
        const skillsData = await db.query(`SELECT id, name FROM skills`);
        let skillCount = 0;
        for (const user of users) {
            const numSkills = Math.floor(Math.random() * 4) + 3; // 3-6 skills
            const shuffled = [...skillsData].sort(() => 0.5 - Math.random());
            const selectedSkills = shuffled.slice(0, numSkills);
            for (const skill of selectedSkills) {
                try {
                    await db.query(`
                        INSERT INTO profile_skills (profile_id, skill_id)
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [user.userId, skill.id]);
                    skillCount++;
                }
                catch (err) {
                    // Ignore
                }
            }
        }
        console.log(`  ✓ Added ${skillCount} skill associations`);
        // Create network connections
        console.log('\n🔗 Creating network connections...');
        let followCount = 0;
        for (let i = 0; i < users.length; i++) {
            const numFollows = Math.floor(Math.random() * 5) + 2; // 2-6 follows per user
            const otherUsers = users.filter((_, idx) => idx !== i);
            const shuffled = [...otherUsers].sort(() => 0.5 - Math.random());
            const toFollow = shuffled.slice(0, numFollows);
            for (const target of toFollow) {
                try {
                    await db.query(`
                        INSERT INTO follows (follower_id, following_id)
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [users[i].userId, target.userId]);
                    followCount++;
                }
                catch (err) {
                    // Ignore
                }
            }
        }
        console.log(`  ✓ Created ${followCount} connections`);
        // Create posts
        console.log('\n📝 Creating posts...');
        const posts = [];
        const postContents = [
            'Excited to share my latest project! #tech #innovation',
            'Just finished an amazing course on machine learning 🚀',
            'Looking forward to connecting with professionals in my field!',
            'Interesting discussion about the future of AI in our industry',
            'Great networking event today! Met amazing people',
            'Sharing some insights from my recent experience...',
            'Proud to announce our team\'s latest achievement! 🎉',
        ];
        for (const user of users) {
            const numPosts = Math.floor(Math.random() * 3) + 1; // 1-3 posts
            for (let p = 0; p < numPosts; p++) {
                const content = postContents[Math.floor(Math.random() * postContents.length)];
                try {
                    const [post] = await db.query(`
                        INSERT INTO posts (profile_id, content, type)
                        VALUES ($1, $2, 'TEXT')
                        RETURNING id
                    `, [user.userId, content]);
                    if (post) {
                        posts.push({ id: post.id, authorId: user.userId });
                    }
                }
                catch (err) {
                    // Ignore
                }
            }
        }
        console.log(`  ✓ Created ${posts.length} posts`);
        // Create likes
        console.log('❤️  Creating likes...');
        let likeCount = 0;
        for (const user of users) {
            const numLikes = Math.floor(Math.random() * 8) + 3; // 3-10 likes
            const shuffled = [...posts].sort(() => 0.5 - Math.random());
            const toLike = shuffled.slice(0, numLikes);
            for (const post of toLike) {
                if (post.authorId !== user.userId) {
                    try {
                        await db.query(`
                            INSERT INTO likes (profile_id, post_id)
                            VALUES ($1, $2)
                            ON CONFLICT DO NOTHING
                        `, [user.userId, post.id]);
                        likeCount++;
                    }
                    catch (err) {
                        // Ignore
                    }
                }
            }
        }
        console.log(`  ✓ Created ${likeCount} likes`);
        // Create tracking signals
        console.log('\n📊 Creating tracking signals...');
        const actions = ['VIEW', 'CLICK', 'LIKE', 'COMMENT'];
        let signalCount = 0;
        for (let i = 0; i < 50; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomPost = posts[Math.floor(Math.random() * posts.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];
            try {
                await db.query(`
                    INSERT INTO user_signals (user_id, item_id, item_type, action_type, weight)
                    VALUES ($1, $2, 'POST', $3, $4)
                `, [randomUser.userId, randomPost.id, action, Math.random() * 5]);
                signalCount++;
            }
            catch (err) {
                // Ignore
            }
        }
        console.log(`  ✓ Created ${signalCount} tracking signals`);
        console.log('\n✅ Successfully created test users!');
        console.log('\n📊 Summary:');
        console.log(`   - ${users.length} new users created`);
        console.log(`   - ${expCount} work experiences`);
        console.log(`   - ${eduCount} education records`);
        console.log(`   - ${skillCount} skill associations`);
        console.log(`   - ${followCount} network connections`);
        console.log(`   - ${posts.length} posts`);
        console.log(`   - ${likeCount} likes`);
        console.log(`   - ${signalCount} tracking signals`);
        console.log('\n🎯 Login credentials for all users:');
        console.log('   Email: [firstname].[lastname][number]@worknet.test');
        console.log('   Password: Test123!');
        console.log('\n🚀 You can now test the recommendation system!');
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        await db.close();
    }
}
createNewUsers().catch(console.error);
//# sourceMappingURL=seed-new-users.js.map