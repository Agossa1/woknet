"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowsRepository = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
class FollowsRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async follow(dto) {
        try {
            const sql = `
                INSERT INTO follows (follower_id, following_id)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING
            `;
            await this.db.query(sql, [dto.follower_id, dto.following_id]);
            return true;
        }
        catch (error) {
            this.logger.instance.error(`[FollowsRepository] Follow error: ${error}`);
            throw new custom_errors_1.DatabaseQueryError("FOLLOW_ERROR", error);
        }
    }
    async unfollow(dto) {
        try {
            const sql = `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`;
            await this.db.query(sql, [dto.follower_id, dto.following_id]);
            return true;
        }
        catch (error) {
            this.logger.instance.error(`[FollowsRepository] Unfollow error: ${error}`);
            throw new custom_errors_1.DatabaseQueryError("UNFOLLOW_ERROR", error);
        }
    }
    async isFollowing(dto) {
        try {
            const sql = `SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2 LIMIT 1`;
            const result = await this.db.query(sql, [dto.follower_id, dto.following_id]);
            return result.length > 0;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("IS_FOLLOWING_ERROR", error);
        }
    }
    async getFollowers(followingId, currentUserId) {
        try {
            const sql = `
                SELECT 
                    p.user_id, p.username, p.display_name, p.avatar_url, u.headline,
                    ${currentUserId ? `EXISTS(SELECT 1 FROM follows f2 WHERE f2.follower_id = $2 AND f2.following_id = p.user_id)` : 'false'} as is_following
                FROM follows f
                JOIN profiles p ON f.follower_id = p.user_id
                JOIN users u ON p.user_id = u.id
                WHERE f.following_id = $1
            `;
            const params = currentUserId ? [followingId, currentUserId] : [followingId];
            return await this.db.query(sql, params);
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("GET_FOLLOWERS_ERROR", error);
        }
    }
    async getFollowing(followerId, currentUserId) {
        try {
            const sql = `
                SELECT 
                    p.user_id, p.username, p.display_name, p.avatar_url, u.headline,
                    ${currentUserId ? `EXISTS(SELECT 1 FROM follows f2 WHERE f2.follower_id = $2 AND f2.following_id = p.user_id)` : 'false'} as is_following
                FROM follows f
                JOIN profiles p ON f.following_id = p.user_id
                JOIN users u ON p.user_id = u.id
                WHERE f.follower_id = $1
            `;
            const params = currentUserId ? [followerId, currentUserId] : [followerId];
            return await this.db.query(sql, params);
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("GET_FOLLOWING_ERROR", error);
        }
    }
    async getFollowCounts(profileId) {
        try {
            const sql = `
                SELECT followers_count as followers, following_count as following
                FROM profiles
                WHERE user_id = $1
            `;
            const result = await this.db.query(sql, [profileId]);
            return result[0] || { followers: 0, following: 0 };
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("GET_FOLLOW_COUNTS_ERROR", error);
        }
    }
}
exports.FollowsRepository = FollowsRepository;
//# sourceMappingURL=follows.repository.js.map