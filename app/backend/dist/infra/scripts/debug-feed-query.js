"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
async function debugFeedQuery() {
    const db = new configDB_1.default();
    try {
        await db.connect();
        console.log("✅ Connected to database\n");
        // Récupérer un utilisateur de test
        const testUser = await db.query(`SELECT id FROM users LIMIT 1;`);
        if (testUser.length === 0) {
            console.log("❌ No users found");
            return;
        }
        const userId = testUser[0].id;
        console.log(`Using test user: ${userId}\n`);
        // 1. Vérifier les posts dans la vue
        console.log("1️⃣ Posts in global_power_feed:");
        const viewPosts = await db.query(`SELECT item_id, author_id FROM global_power_feed LIMIT 5;`);
        viewPosts.forEach((p, i) => {
            console.log(`   ${i + 1}. item_id: ${p.item_id}, author_id: ${p.author_id}`);
        });
        console.log();
        // 2. Vérifier si ces posts existent dans la table posts
        if (viewPosts.length > 0) {
            const firstPostId = viewPosts[0].item_id;
            console.log(`2️⃣ Checking if post ${firstPostId} exists in posts table:`);
            const postCheck = await db.query(`SELECT id, profile_id, company_id FROM posts WHERE id = $1;`, [firstPostId]);
            if (postCheck.length > 0) {
                console.log(`   ✅ Post exists: profile_id=${postCheck[0].profile_id}, company_id=${postCheck[0].company_id}`);
            }
            else {
                console.log(`   ❌ Post NOT found in posts table!`);
            }
            console.log();
            // 3. Vérifier le profil associé
            if (postCheck.length > 0 && postCheck[0].profile_id) {
                const profileId = postCheck[0].profile_id;
                console.log(`3️⃣ Checking profile ${profileId}:`);
                const profileCheck = await db.query(`SELECT user_id FROM profiles WHERE user_id = $1;`, [profileId]);
                if (profileCheck.length > 0) {
                    console.log(`   ✅ Profile exists`);
                }
                else {
                    console.log(`   ❌ Profile NOT found!`);
                }
                console.log();
                // 4. Vérifier l'utilisateur associé
                console.log(`4️⃣ Checking user ${profileId}:`);
                const userCheck = await db.query(`SELECT id FROM users WHERE id = $1;`, [profileId]);
                if (userCheck.length > 0) {
                    console.log(`   ✅ User exists`);
                }
                else {
                    console.log(`   ❌ User NOT found!`);
                }
                console.log();
            }
        }
        // 5. Tester la requête complète étape par étape
        console.log("5️⃣ Testing full feed query step by step:");
        // Test avec LEFT JOIN pour voir ce qui manque
        const testQuery = await db.query(`
      SELECT 
        f.item_id,
        f.author_id,
        p.id as post_id,
        p.profile_id,
        pr.user_id as profile_user_id,
        u.id as user_id
      FROM global_power_feed f
      LEFT JOIN posts p ON p.id = f.item_id
      LEFT JOIN profiles pr ON p.profile_id = pr.user_id
      LEFT JOIN users u ON pr.user_id = u.id
      WHERE f.content_type = 'POST'
      LIMIT 5;
    `);
        console.log(`   Returned ${testQuery.length} rows:`);
        testQuery.forEach((row, i) => {
            console.log(`   ${i + 1}. item_id: ${row.item_id}, post_id: ${row.post_id || 'NULL'}, profile_user_id: ${row.profile_user_id || 'NULL'}, user_id: ${row.user_id || 'NULL'}`);
        });
        console.log();
        // 6. Tester avec JOIN (strict) pour voir ce qui échoue
        console.log("6️⃣ Testing with strict JOINs:");
        const strictQuery = await db.query(`
      SELECT 
        f.item_id,
        p.id as post_id
      FROM global_power_feed f
      JOIN posts p ON p.id = f.item_id
      JOIN profiles pr ON p.profile_id = pr.user_id
      JOIN users u ON pr.user_id = u.id
      WHERE f.content_type = 'POST'
      LIMIT 5;
    `);
        console.log(`   Returned ${strictQuery.length} rows`);
        if (strictQuery.length === 0) {
            console.log("   ⚠️  Strict JOINs return 0 rows - this is the problem!");
        }
    }
    catch (error) {
        console.error("\n❌ Error:", error.message);
        console.error("   Code:", error.code);
        console.error("   Detail:", error.detail);
    }
    finally {
        await db.close();
    }
}
debugFeedQuery().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
//# sourceMappingURL=debug-feed-query.js.map