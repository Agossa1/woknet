import { Request, Response } from 'express';
import { FeedService } from './feed.services';

export class FeedController {
    constructor(private feedService: FeedService) { }

    async handle(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            
            if (!userId) {
                return res.status(401).json({ 
                    success: false, 
                    error: "User not authenticated" 
                });
            }

            // Si l'utilisateur est en "cold start" (aucune interaction encore enregistrée),
            // on lui propose un feed initial basé sur son secteur d'activité.
            const isColdStart = await this.feedService.isColdStartUser(userId);
            if (isColdStart) {
                const result = await this.feedService.getColdStartFeed(userId);
                return res.status(200).json({
                    success: true,
                    data: result.items,
                    metadata: {
                        page: 1,
                        pageSize: result.items.length,
                        hasMore: result.hasMore,
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
                    timestamp: req.query.cursor_timestamp as string,
                    itemId: req.query.cursor_item_id as string
                };

                const limit = Math.min(parseInt(req.query.limit as string, 10) || 15, 100);
                
                const result = await this.feedService.getPowerFeedWithCursor(userId, limit, cursor);

                return res.status(200).json({
                    success: true,
                    data: result.items,
                    metadata: {
                        pageSize: result.items.length,
                        hasMore: result.hasMore,
                        nextCursor: result.nextCursor,
                        personalization: result.cursor_info?.personalization,
                        method: 'cursor-based',
                        serverTime: new Date().toISOString(),
                    }
                });
            } else {
                // Mode page-based (ancien, pour compatibilité)
                const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);

                const result = await this.feedService.getPowerFeed(userId, page);

                return res.status(200).json({
                    success: true,
                    data: result.items,
                    metadata: {
                        page,
                        pageSize: result.items.length,
                        hasMore: result.hasMore,
                        method: 'offset-based',
                        serverTime: new Date().toISOString(),
                    }
                });
            }

        } catch (error: any) {
            console.error(`[FeedController] Error:`, error);

            return res.status(error.status || 500).json({ 
                success: false,
                error: error.message || "Impossible de charger le flux",
                code: "FEED_ERROR"
            });
        }
    }
}
