"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const db = new configDB_1.default();
async function simpleSeed() {
    console.log('🌱 Seeding recommendation test data...\n');
    try {
        await db.connect();
        // Get existing users
        const existingUsers = await db.query(`SELECT id FROM users WHERE is_verified = true LIMIT 20`);
        if (existingUsers.length < 2) {
            console.log('❌ Not enough verified users in database. Please register some users first.');
            return;
        }
        console.log(`✅ Found ${existingUsers.length} users`);
        // Create some follows (connections)
        console.log('\n🔗 Creating network connections...');
        let connectionCount = 0;
        for (let i = 0; i < existingUsers.length; i++) {
            for (let j = i + 1; j < Math.min(i + 5, existingUsers.length); j++) {
                try {
                    await db.query(`
                        INSERT INTO follows (follower_id, following_id)
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [existingUsers[i].id, existingUsers[j].id]);
                    connectionCount++;
                }
                catch (err) {
                    // Ignore conflicts
                }
            }
        }
        console.log(`  ✓ Created ${connectionCount} connections`);
        // Create some posts
        console.log('\n📝 Creating posts...');
        const posts = [];
        for (let i = 0; i < Math.min(10, existingUsers.length); i++) {
            try {
                const [post] = await db.query(`
                    INSERT INTO posts (profile_id, content, type)
                    VALUES ($1, $2, 'TEXT')
                    RETURNING id
                `, [existingUsers[i].id, `Test post #${i} about professional networking`]);
                if (post) {
                    posts.push({ id: post.id, authorId: existingUsers[i].id });
                }
            }
            catch (err) {
                console.log(`  ⚠️  Could not create post for user ${i}`);
            }
        }
        console.log(`  ✓ Created ${posts.length} posts`);
        // Create likes (similar behavior)
        console.log('\n❤️  Creating likes...');
        let likeCount = 0;
        for (const user of existingUsers) {
            for (const post of posts) {
                if (post.authorId !== user.id && Math.random() > 0.7) {
                    try {
                        await db.query(`
                            INSERT INTO likes (profile_id, post_id)
                            VALUES ($1, $2)
                            ON CONFLICT DO NOTHING
                        `, [user.id, post.id]);
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
        const actions = [' VIEW', 'CLICK', 'LIKE'];
        let signalCount = 0;
        for (let i = 0; i < 30; i++) {
            const randomUser = existingUsers[Math.floor(Math.random() * existingUsers.length)];
            const randomPost = posts[Math.floor(Math.random() * posts.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];
            try {
                await db.query(`
                    INSERT INTO user_signals (user_id, item_id, item_type, action_type, weight)
                    VALUES ($1, $2, 'POST', $3, $4)
                `, [randomUser.id, randomPost.id, action, Math.random() * 5]);
                signalCount++;
            }
            catch (err) {
                // Ignore
            }
        }
        console.log(`  ✓ Created ${signalCount} tracking signals`);
        console.log('\n✅ Seeding completed!');
        console.log('\n📊 Summary:');
        console.log(`   - ${existingUsers.length} users available`);
        console.log(`   - ${connectionCount} connections created`);
        console.log(`   - ${posts.length} posts created`);
        console.log(`   - ${likeCount} likes created`);
        console.log(`   - ${signalCount} tracking signals created`);
        console.log('\n🎯 You can now test the recommendation system!');
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        await db.close();
    }
}
simpleSeed().catch(console.error);
//# sourceMappingURL=seed-recommendations-simple.js.map