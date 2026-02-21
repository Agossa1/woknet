"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikesRepository = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
class LikesRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async addLike(dto) {
        try {
            const sql = `
                INSERT INTO likes (profile_id, post_id, reaction_type)
                VALUES ($1, $2, $3)
                ON CONFLICT (profile_id, post_id) 
                DO UPDATE SET reaction_type = EXCLUDED.reaction_type
            `;
            const reactionType = dto.reaction_type || 'LIKE'; // Défaut: LIKE
            await this.db.query(sql, [dto.profile_id, dto.post_id, reactionType]);
            return true;
        }
        catch (error) {
            this.logger.instance.error(`[LikesRepository] Add like error: ${error}`);
            throw new custom_errors_1.DatabaseQueryError("ADD_LIKE_ERROR", error);
        }
    }
    async removeLike(dto) {
        try {
            const sql = `DELETE FROM likes WHERE profile_id = $1 AND post_id = $2`;
            await this.db.query(sql, [dto.profile_id, dto.post_id]);
            return true;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("REMOVE_LIKE_ERROR", error);
        }
    }
    async isLiked(dto) {
        try {
            const sql = `SELECT 1 FROM likes WHERE profile_id = $1 AND post_id = $2 LIMIT 1`;
            const result = await this.db.query(sql, [dto.profile_id, dto.post_id]);
            return result.length > 0;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("CHECK_LIKE_ERROR", error);
        }
    }
    async getPostLikes(postId) {
        try {
            const sql = `SELECT * FROM likes WHERE post_id = $1`;
            return await this.db.query(sql, [postId]);
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("GET_POST_LIKES_ERROR", error);
        }
    }
    async getPostLikesWithUsers(postId) {
        try {
            const sql = `
                SELECT 
                    l.profile_id,
                    l.post_id,
                    l.reaction_type,
                    l.created_at,
                    u.full_name,
                    p.username,
                    p.display_name,
                    p.avatar_url
                FROM likes l
                INNER JOIN profiles p ON l.profile_id = p.user_id
                INNER JOIN users u ON p.user_id = u.id
                WHERE l.post_id = $1
                ORDER BY l.created_at DESC
            `;
            return await this.db.query(sql, [postId]);
        }
        catch (error) {
            this.logger.instance.error(`[LikesRepository] Get post likes with users error: ${error}`);
            throw new custom_errors_1.DatabaseQueryError("GET_POST_LIKES_WITH_USERS_ERROR", error);
        }
    }
    async getPostReactionCounts(postId) {
        try {
            const sql = `
                SELECT 
                    reaction_type,
                    COUNT(*) as count
                FROM likes
                WHERE post_id = $1
                GROUP BY reaction_type
            `;
            const results = await this.db.query(sql, [postId]);
            // Convert array to object: { LIKE: 45, LOVE: 12, ... }
            const counts = {};
            results.forEach(row => {
                counts[row.reaction_type] = parseInt(row.count, 10);
            });
            return counts;
        }
        catch (error) {
            this.logger.instance.error(`[LikesRepository] Get post reaction counts error: ${error}`);
            throw new custom_errors_1.DatabaseQueryError("GET_POST_REACTION_COUNTS_ERROR", error);
        }
    }
    async addCommentLike(dto) {
        try {
            const sql = `
                INSERT INTO comment_likes (profile_id, comment_id, reaction_type)
                VALUES ($1, $2, $3)
                ON CONFLICT (profile_id, comment_id)
                DO UPDATE SET reaction_type = EXCLUDED.reaction_type
            `;
            const reactionType = dto.reaction_type || 'LIKE'; // Défaut: LIKE
            await this.db.query(sql, [dto.profile_id, dto.comment_id, reactionType]);
            return true;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("ADD_COMMENT_LIKE_ERROR", error);
        }
    }
    async removeCommentLike(dto) {
        try {
            const sql = `DELETE FROM comment_likes WHERE profile_id = $1 AND comment_id = $2`;
            await this.db.query(sql, [dto.profile_id, dto.comment_id]);
            return true;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("REMOVE_COMMENT_LIKE_ERROR", error);
        }
    }
    async isCommentLiked(dto) {
        try {
            const sql = `SELECT 1 FROM comment_likes WHERE profile_id = $1 AND comment_id = $2 LIMIT 1`;
            const result = await this.db.query(sql, [dto.profile_id, dto.comment_id]);
            return result.length > 0;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("CHECK_COMMENT_LIKE_ERROR", error);
        }
    }
}
exports.LikesRepository = LikesRepository;
//# sourceMappingURL=likes.repository.js.map