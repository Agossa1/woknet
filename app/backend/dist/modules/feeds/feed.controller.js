"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedController = void 0;
class FeedController {
    constructor(feedService) {
        this.feedService = feedService;
    }
    async handle(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                console.warn(`[FeedController] Unauthenticated request to /feed`);
                return res.status(401).json({
                    success: false,
                    error: "User not authenticated"
                });
            }
            console.log(`[FeedController] Fetching feed for user ${userId}, page=${req.query.page || 1}`);
            // Si l'utilisateur est en "cold start" (aucune interaction encore enregistrée),
            // on lui propose un feed initial basé sur son secteur d'activité.
            const isColdStart = await this.feedService.isColdStartUser(userId);
            if (isColdStart) {
                console.log(`[FeedController] User ${userId} is in cold start, using cold-start feed`);
                const result = await this.feedService.getColdStartFeed(userId);
                console.log(`[FeedController] Cold-start feed returned ${result.items?.length || 0} items`);
                return res.status(200).json({
                    success: true,
                    data: result.items || [],
                    metadata: {
                        page: 1,
                        pageSize: result.items?.length || 0,
                        hasMore: result.hasMore || false,
                        method: 'cold-start-industry',
                        serverTime: new Date().toISOString(),
                    }
                });
            }
            // Support des deux modes: page (ancien) et cursor (nouveau)
            const useCursor = req.query.cursor_timestamp && req.query.cursor_item_id;
            if (useCursor) {
                // Mode cursor-based (nouveau, recommandé)
                const cursor = {
                    timestamp: req.query.cursor_timestamp,
                    itemId: req.query.cursor_item_id
                };
                const limit = Math.min(parseInt(req.query.limit, 10) || 15, 100);
                console.log(`[FeedController] Using cursor-based feed, limit=${limit}`);
                const result = await this.feedService.getPowerFeedWithCursor(userId, limit, cursor);
                console.log(`[FeedController] Cursor feed returned ${result.items?.length || 0} items`);
                return res.status(200).json({
                    success: true,
                    data: result.items || [],
                    metadata: {
                        pageSize: result.items?.length || 0,
                        hasMore: result.hasMore || false,
                        nextCursor: result.nextCursor,
                        personalization: result.cursor_info?.personalization,
                        method: 'cursor-based',
                        serverTime: new Date().toISOString(),
                    }
                });
            }
            else {
                // Mode page-based (ancien, pour compatibilité)
                const page = Math.max(1, parseInt(req.query.page, 10) || 1);
                console.log(`[FeedController] Using page-based feed, page=${page}`);
                const result = await this.feedService.getPowerFeed(userId, page);
                console.log(`[FeedController] Page feed returned ${result.items?.length || 0} items`);
                return res.status(200).json({
                    success: true,
                    data: result.items || [],
                    metadata: {
                        page,
                        pageSize: result.items?.length || 0,
                        hasMore: result.hasMore || false,
                        method: 'offset-based',
                        serverTime: new Date().toISOString(),
                    }
                });
            }
        }
        catch (error) {
            console.error(`[FeedController] Error:`, {
                message: error.message,
                stack: error.stack,
                code: error.code,
                userId: req.user?.id
            });
            return res.status(error.status || 500).json({
                success: false,
                error: error.message || "Impossible de charger le flux",
                code: "FEED_ERROR"
            });
        }
    }
}
exports.FeedController = FeedController;
//# sourceMappingURL=feed.controller.js.map