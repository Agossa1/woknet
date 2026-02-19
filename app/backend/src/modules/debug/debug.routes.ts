import { Router, Request, Response } from 'express';
import PostgresDatabase from '../../config/databases/configDB';
import Logger from '../../infra/logger/winston';

const router = Router();
const db = new PostgresDatabase();
const logger = new Logger();

/**
 * Debug endpoint to check database state
 */
router.get('/debug/database-state', async (req: Request, res: Response) => {
    try {
        const queries = {
            totalPosts: 'SELECT COUNT(*) as count FROM posts;',
            recentPostCount: 'SELECT COUNT(*) as count FROM posts WHERE created_at > NOW() - INTERVAL \'30 days\';',
            samplePosts: 'SELECT id, profile_id, content, likes_count, created_at FROM posts LIMIT 5;',
            viewTest: 'SELECT COUNT(*) as count FROM global_power_feed;',
            viewSample: 'SELECT * FROM global_power_feed LIMIT 3;',
        };

        const results: any = {};

        for (const [key, query] of Object.entries(queries)) {
            try {
                results[key] = await db.query(query);
            } catch (error) {
                results[key] = { error: String(error) };
            }
        }

        return res.status(200).json({
            success: true,
            data: results,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.instance.error(`[Debug] Error: ${error}`);
        return res.status(500).json({
            success: false,
            error: String(error),
        });
    }
});

export default router;
