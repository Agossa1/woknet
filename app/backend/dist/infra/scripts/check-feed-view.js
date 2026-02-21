"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function checkFeedView() {
    const db = new configDB_1.default();
    try {
        await db.connect();
        console.log("✅ Connected to database\n");
        // 1. Vérifier si la vue existe
        console.log("📋 Checking if global_power_feed view exists...");
        const viewCheck = await db.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'global_power_feed'
      ) as exists;
    `);
        const viewExists = viewCheck[0]?.exists;
        console.log(`   View exists: ${viewExists ? "✅ YES" : "❌ NO"}\n`);
        // 2. Vérifier le nombre de posts
        console.log("📊 Checking posts table...");
        const postsCount = await db.query(`SELECT COUNT(*) as count FROM posts;`);
        console.log(`   Total posts: ${postsCount[0]?.count || 0}\n`);
        // 3. Si la vue n'existe pas, la créer
        if (!viewExists) {
            console.log("🔧 Creating global_power_feed view...");
            const sqlPath = path_1.default.join(__dirname, "../sql/32_create_global_power_feed_view.sql");
            const sql = fs_1.default.readFileSync(sqlPath, "utf8");
            // Exécuter le SQL
            await db.query(sql);
            console.log("   ✅ View created successfully!\n");
        }
        else {
            // Vérifier le contenu de la vue
            console.log("📋 Checking view content...");
            const viewContent = await db.query(`SELECT COUNT(*) as count FROM global_power_feed;`);
            console.log(`   Items in view: ${viewContent[0]?.count || 0}\n`);
            // Afficher quelques exemples
            const samples = await db.query(`SELECT * FROM global_power_feed LIMIT 3;`);
            if (samples.length > 0) {
                console.log("   Sample items:");
                samples.forEach((item, idx) => {
                    console.log(`   ${idx + 1}. item_id: ${item.item_id}, author_id: ${item.author_id}, base_score: ${item.base_score}`);
                });
                console.log();
            }
        }
        // 4. Tester la requête complète du feed
        console.log("🧪 Testing feed query...");
        const testUserId = await db.query(`SELECT id FROM users LIMIT 1;`);
        if (testUserId.length > 0) {
            const userId = testUserId[0].id;
            console.log(`   Using test user: ${userId}`);
            const feedTest = await db.query(`
        SELECT 
          p.*,
          f.item_id,
          f.author_id,
          f.content_type,
          f.base_score,
          f.created_at as feed_created_at
        FROM global_power_feed f
        JOIN posts p ON p.id = f.item_id
        LEFT JOIN companies c ON p.company_id = c.id
        JOIN profiles pr ON p.profile_id = pr.user_id
        JOIN users u ON pr.user_id = u.id
        WHERE f.content_type = 'POST'
        LIMIT 5;
      `);
            console.log(`   ✅ Query successful! Returned ${feedTest.length} items\n`);
            if (feedTest.length > 0) {
                console.log("   Sample feed items:");
                feedTest.forEach((item, idx) => {
                    console.log(`   ${idx + 1}. Post ID: ${item.id}, Author: ${item.author_id}, Score: ${item.base_score}`);
                });
            }
            else {
                console.log("   ⚠️  No items returned (might be normal if no posts exist)");
            }
        }
        else {
            console.log("   ⚠️  No users found in database");
        }
        console.log("\n✅ Diagnostic complete!");
    }
    catch (error) {
        console.error("\n❌ Error during diagnostic:", error.message);
        console.error("   Code:", error.code);
        console.error("   Detail:", error.detail);
        process.exit(1);
    }
    finally {
        await db.close();
    }
}
checkFeedView().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
//# sourceMappingURL=check-feed-view.js.map