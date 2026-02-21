"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRecommendationsRepository = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
class UserRecommendationsRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async createRecommendation(giverId, receiverId, content, relationship) {
        try {
            const sql = `
                INSERT INTO user_recommendations (giver_id, receiver_id, content, relationship)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            const result = await this.db.query(sql, [giverId, receiverId, content, relationship]);
            return result[0];
        }
        catch (error) {
            this.logger.instance.error(`Failed to create recommendation: ${error}`);
            throw new custom_errors_1.InternalServerError("Failed to create recommendation");
        }
    }
    async getReceivedRecommendations(profileId) {
        const sql = `
            SELECT r.*, p.display_name as giver_name, p.avatar_url as giver_avatar, p.username as giver_username
            FROM user_recommendations r
            JOIN profiles p ON r.giver_id = p.user_id
            WHERE r.receiver_id = $1 AND r.status = 'APPROVED'
            ORDER BY r.created_at DESC
        `;
        return await this.db.query(sql, [profileId]);
    }
    async getSentRecommendations(profileId) {
        const sql = `
            SELECT r.*, p.display_name as receiver_name, p.avatar_url as receiver_avatar, p.username as receiver_username
            FROM user_recommendations r
            JOIN profiles p ON r.receiver_id = p.user_id
            WHERE r.giver_id = $1
            ORDER BY r.created_at DESC
        `;
        return await this.db.query(sql, [profileId]);
    }
    async getPendingRecommendations(profileId) {
        const sql = `
            SELECT r.*, p.display_name as giver_name, p.avatar_url as giver_avatar, p.username as giver_username
            FROM user_recommendations r
            JOIN profiles p ON r.giver_id = p.user_id
            WHERE r.receiver_id = $1 AND r.status = 'PENDING'
            ORDER BY r.created_at DESC
        `;
        return await this.db.query(sql, [profileId]);
    }
    async updateStatus(id, status) {
        const sql = `UPDATE user_recommendations SET status = $2 WHERE id = $1`;
        await this.db.query(sql, [id, status]);
    }
    async deleteRecommendation(id, profileId) {
        // Only giver or receiver can delete (or receiver can hide it)
        const sql = `DELETE FROM user_recommendations WHERE id = $1 AND (giver_id = $2 OR receiver_id = $2)`;
        await this.db.query(sql, [id, profileId]);
    }
    async findById(id) {
        const sql = `SELECT * FROM user_recommendations WHERE id = $1`;
        const result = await this.db.query(sql, [id]);
        return result.length > 0 ? result[0] : null;
    }
}
exports.UserRecommendationsRepository = UserRecommendationsRepository;
//# sourceMappingURL=user-recommendations.repository.js.map