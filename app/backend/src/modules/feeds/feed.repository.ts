import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import { validate as isUuid } from 'uuid';
import redisClient from "../../config/redis/redis";
import { socketService } from "../../infra/realtime/socket.service";

export class FeedRepository {
    private readonly CACHE_TTL = 15; // 15 secondes pour plus de fluidité et de fraîcheur

   constructor(
    private readonly db = new PostgresDatabase(),
    private readonly logger = new Logger(),
    private readonly redis = redisClient, // Remove 'new'
    private readonly socket = socketService // Check if this needs 'new' removed too
) {}

    /**
     * Clé de cache unique par utilisateur et pagination
     */
    private getCacheKey(userId: string, limit: number, offset: number): string {
        return `feed:${userId}:lim${limit}:off${offset}`;
    }

    /**
     * Invalide intelligemment tout le cache de feed pour un utilisateur donné.
     * Utilise SCAN pour trouver toutes les pages/curseurs sans bloquer Redis.
     */
    async invalidateUserFeed(userId: string): Promise<void> {
        if (!this.redis) return;
        try {
            const pattern = `feed:${userId}:*`;
            const keys: string[] = [];
            // Batching : On regroupe les suppressions pour limiter les aller-retours réseau
            for await (const key of this.redis.scanIterator({ MATCH: pattern })) {
                keys.push(key);
                if (keys.length >= 50) {
                    // UNLINK est non-bloquant (asynchrone côté serveur Redis), contrairement à DEL
                    await this.redis.unlink(keys);
                    keys.length = 0;
                }
            }
            if (keys.length > 0) {
                await this.redis.unlink(keys);
            }
        } catch (error) {
            this.logger.instance.error(`[FeedRepository] Cache invalidation error: ${error}`);
        }
    }

    async getMainFeed(userId: string, limit: number = 20, offset: number = 0) {
        try {
            this.validateParams(userId, limit, offset);

            const cacheKey = this.getCacheKey(userId, limit, offset);

            if (this.redis) {
                const cached = await this.redis.get(cacheKey);
                if (cached) {
                    return JSON.parse(cached);
                }
            }

            const query = `
                SELECT 
                    p.*,
                    f.item_id,
                    f.author_id,
                    f.content_type,
                    f.base_score,
                    f.created_at as feed_created_at,
                    COALESCE(c.slug, pr.username) as username,
                    COALESCE(c.name, pr.display_name) as display_name,
                    COALESCE(c.logo_url, pr.avatar_url) as avatar_url,
                    COALESCE(c.name, u.full_name) as full_name,
                    COALESCE(c.description, u.headline) as headline,
                    c.company_type, c.company_size,
                    pr.reputation_score as author_reputation_score,
                    pr.is_verified as author_is_verified,
                    pr.follower_count as author_follower_count,
                    pr.skills as author_skills,
                    EXISTS(
                        SELECT 1 FROM likes l 
                        WHERE l.post_id = p.id AND l.profile_id = $1
                    ) as "isLiked",
                    (
                        SELECT reaction_type 
                        FROM likes l 
                        WHERE l.post_id = p.id AND l.profile_id = $1
                    ) as "reactionType",
                    (
                        SELECT COALESCE(array_to_json(array_agg(DISTINCT reaction_type)), '[]'::json) 
                        FROM likes 
                        WHERE post_id = p.id
                    ) as "reactionTypes",
                    EXISTS(
                        SELECT 1 FROM saved_posts sp 
                        WHERE sp.post_id = p.id AND sp.profile_id = $1
                    ) as "isSaved"
                FROM global_power_feed f
                JOIN posts p ON p.id = f.item_id
                LEFT JOIN companies c ON p.company_id = c.id
                JOIN profiles pr ON p.profile_id = pr.user_id
                JOIN users u ON pr.user_id = u.id
                WHERE f.content_type = 'POST'
                AND NOT EXISTS (
                    SELECT 1 FROM user_signals us 
                    WHERE us.user_id = $1 AND us.item_id = f.item_id AND us.action_type = 'DISMISS'
                )
                ORDER BY f.base_score DESC, f.created_at DESC
                LIMIT $2 OFFSET $3;
            `;

            const results = await this.db.query(query, [userId, limit, offset]);

            if (this.redis) {
                await this.redis.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(results));
            }

            return results;
        } catch (error) {
            this.logger.instance.error(`[FeedRepository] Error fetching feed: ${error}`);
            throw error;
        }
    }

    /**
     * Cold-start feed basé sur le secteur (industry_id) de l'utilisateur.
     * On récupère des posts publics dont l'auteur appartient au même secteur.
     * Si aucun secteur ou aucun résultat, on retombe sur le main feed classique.
     */
    async getColdStartFeedByIndustry(userId: string, limit: number = 20) {
        try {
            this.validateParams(userId, limit, 0);

            const sql = `
                WITH me AS (
                    SELECT industry_id
                    FROM users
                    WHERE id = $1
                )
                SELECT 
                    p.*,
                    COALESCE(c.slug, pr.username) AS username,
                    COALESCE(c.name, pr.display_name) AS display_name,
                    COALESCE(c.logo_url, pr.avatar_url) AS avatar_url,
                    COALESCE(c.name, u.full_name) AS full_name,
                    COALESCE(c.description, u.headline) AS headline,
                    c.company_type, 
                    c.company_size,
                    -- Flags d'engagement pour l'utilisateur courant
                    EXISTS(
                        SELECT 1 FROM likes l 
                        WHERE l.post_id = p.id AND l.profile_id = $1
                    ) AS "isLiked",
                    (
                        SELECT reaction_type 
                        FROM likes l 
                        WHERE l.post_id = p.id AND l.profile_id = $1
                    ) AS "reactionType",
                    (
                        SELECT COALESCE(array_to_json(array_agg(DISTINCT reaction_type)), '[]'::json) 
                        FROM likes 
                        WHERE post_id = p.id
                    ) AS "reactionTypes",
                    EXISTS(
                        SELECT 1 FROM saved_posts sp 
                        WHERE sp.post_id = p.id AND sp.profile_id = $1
                    ) AS "isSaved"
                FROM posts p
                JOIN profiles pr ON p.profile_id = pr.user_id
                JOIN users u ON pr.user_id = u.id
                LEFT JOIN companies c ON p.company_id = c.id
                JOIN me ON u.industry_id = me.industry_id
                WHERE 
                    p.visibility = 'PUBLIC'
                ORDER BY 
                    p.hot_score DESC,
                    p.created_at DESC
                LIMIT $2;
            `;

            const results = await this.db.query(sql, [userId, limit]);

            // Si aucun secteur ou pas de contenu dans ce secteur, fallback sur le main feed
            if (!results || results.length === 0) {
                return this.getMainFeed(userId, limit, 0);
            }

            return results;
        } catch (error) {
            this.logger.instance.error(`[FeedRepository] Error fetching cold-start feed by industry: ${error}`);
            // En cas de problème, on ne casse pas le feed : fallback main feed
            return this.getMainFeed(userId, limit, 0);
        }
    }

    /**
     * Cursor-based pagination (O(log n) performance)
     * Évite le problème OFFSET qui devient lent à scale
     */
    async getMainFeedWithCursor(
        userId: string,
        limit: number = 20,
        cursor?: { timestamp: string; itemId: string }
    ) {
        try {
            this.validateParams(userId, limit, 0);

            if (limit > 100) limit = 100; // Safety check

            // Clé de cache spécifique au cursor
            const cacheKey = cursor
                ? `feed:${userId}:cursor:${cursor.timestamp}:${cursor.itemId}`
                : `feed:${userId}:cursor:initial`;

            if (this.redis) {
                const cached = await this.redis.get(cacheKey);
                if (cached) {
                    return JSON.parse(cached);
                }
            }

            // Handler cursor: fetch +1 pour savoir s'il y a plus
            const fetchLimit = limit + 1;

            let query = `
                SELECT 
                    p.id,
                    p.*,
                    f.item_id,
                    f.author_id,
                    f.content_type,
                    f.base_score,
                    f.created_at as feed_created_at,
                    COALESCE(c.slug, pr.username) as username,
                    COALESCE(c.name, pr.display_name) as display_name,
                    COALESCE(c.logo_url, pr.avatar_url) as avatar_url,
                    COALESCE(c.name, u.full_name) as full_name,
                    COALESCE(c.description, u.headline) as headline,
                    c.company_type, c.company_size,
                    pr.reputation_score as author_reputation_score,
                    pr.is_verified as author_is_verified,
                    pr.follower_count as author_follower_count,
                    pr.skills as author_skills,
                    EXISTS(
                        SELECT 1 FROM likes l 
                        WHERE l.post_id = p.id AND l.profile_id = $1
                    ) as "isLiked",
                    (
                        SELECT reaction_type 
                        FROM likes l 
                        WHERE l.post_id = p.id AND l.profile_id = $1
                    ) as "reactionType",
                    (
                        SELECT COALESCE(array_to_json(array_agg(DISTINCT reaction_type)), '[]'::json) 
                        FROM likes 
                        WHERE post_id = p.id
                    ) as "reactionTypes",
                    EXISTS(
                        SELECT 1 FROM saved_posts sp 
                        WHERE sp.post_id = p.id AND sp.profile_id = $1
                    ) as "isSaved"
                FROM global_power_feed f
                JOIN posts p ON p.id = f.item_id
                LEFT JOIN companies c ON p.company_id = c.id
                JOIN profiles pr ON p.profile_id = pr.user_id
                JOIN users u ON pr.user_id = u.id
                WHERE f.content_type = 'POST'
                AND NOT EXISTS (
                    SELECT 1 FROM user_signals us 
                    WHERE us.user_id = $1 AND us.item_id = f.item_id AND us.action_type = 'DISMISS'
                )
            `;

            let params: any[] = [userId];

            if (cursor) {
                // Cursor pagination: fetch items AFTER this cursor
                query += ` AND (f.created_at, p.id) < ($2::timestamp with time zone, $3::uuid)`;
                params.push(cursor.timestamp, cursor.itemId);
            }

            query += ` ORDER BY f.created_at DESC, p.id DESC LIMIT $${params.length + 1}`;
            params.push(fetchLimit);

            const results = await this.db.query(query, params);

            // Détermine s'il y a plus de résultats
            const hasMore = results.length > limit;
            const items = hasMore ? results.slice(0, limit) : results;

            // Calcule le prochain cursor
            const nextCursor = hasMore && items.length > 0
                ? {
                    timestamp: items[items.length - 1].feed_created_at,
                    itemId: items[items.length - 1].id,
                }
                : null;

            const response = { items, hasMore, nextCursor };

            if (this.redis) {
                await this.redis.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(response));
            }

            return response;
        } catch (error) {
            this.logger.instance.error(`[FeedRepository] Error fetching feed with cursor: ${error}`);
            throw error;
        }
    }

    /**
     * WEBSOCKET : Diffuser un nouveau post en temps réel
     */
    async broadcastNewPost(post: any) {
        try {
            this.socket.emit('NEW_FEED_ITEM', post);
        } catch (error) {
            this.logger.instance.error(`[FeedRepository] Broadcast error: ${error}`);
        }
    }

    private validateParams(userId: string, limit: number, offset: number) {
        if (!isUuid(userId)) throw new Error("Invalid User ID format");
        if (limit < 0 || limit > 100) throw new Error("Limit must be between 0 and 100");
        if (offset < 0) throw new Error("Offset cannot be negative");
    }
}
