"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const router = (0, express_1.Router)();
const db = new configDB_1.default();
const logger = new winston_1.default();
/**
 * Debug endpoint to check database state
 */
router.get('/debug/database-state', async (req, res) => {
    try {
        const queries = {
            totalPosts: 'SELECT COUNT(*) as count FROM posts;',
            recentPostCount: 'SELECT COUNT(*) as count FROM posts WHERE created_at > NOW() - INTERVAL \'30 days\';',
            samplePosts: 'SELECT id, profile_id, content, likes_count, created_at FROM posts LIMIT 5;',
            viewTest: 'SELECT COUNT(*) as count FROM global_power_feed;',
            viewSample: 'SELECT * FROM global_power_feed LIMIT 3;',
        };
        const results = {};
        for (const [key, query] of Object.entries(queries)) {
            try {
                results[key] = await db.query(query);
            }
            catch (error) {
                results[key] = { error: String(error) };
            }
        }
        return res.status(200).json({
            success: true,
            data: results,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger.instance.error(`[Debug] Error: ${error}`);
        return res.status(500).json({
            success: false,
            error: String(error),
        });
    }
});
exports.default = router;
//# sourceMappingURL=debug.routes.js.map