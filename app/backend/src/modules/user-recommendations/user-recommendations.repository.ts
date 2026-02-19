import { InternalServerError } from "../../errors/custom-errors";
import Logger from "../../infra/logger/winston";
import { UserRecommendation, RecommendationStatus } from "./user-recommendations.types";

export interface IDatabase {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
}

export class UserRecommendationsRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger
    ) { }

    async createRecommendation(giverId: string, receiverId: string, content: string, relationship?: string): Promise<UserRecommendation> {
        try {
            const sql = `
                INSERT INTO user_recommendations (giver_id, receiver_id, content, relationship)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            const result = await this.db.query<UserRecommendation>(sql, [giverId, receiverId, content, relationship]);
            return result[0];
        } catch (error) {
            this.logger.instance.error(`Failed to create recommendation: ${error}`);
            throw new InternalServerError("Failed to create recommendation");
        }
    }

    async getReceivedRecommendations(profileId: string): Promise<UserRecommendation[]> {
        const sql = `
            SELECT r.*, p.display_name as giver_name, p.avatar_url as giver_avatar, p.username as giver_username
            FROM user_recommendations r
            JOIN profiles p ON r.giver_id = p.user_id
            WHERE r.receiver_id = $1 AND r.status = 'APPROVED'
            ORDER BY r.created_at DESC
        `;
        return await this.db.query<UserRecommendation>(sql, [profileId]);
    }

    async getSentRecommendations(profileId: string): Promise<UserRecommendation[]> {
        const sql = `
            SELECT r.*, p.display_name as receiver_name, p.avatar_url as receiver_avatar, p.username as receiver_username
            FROM user_recommendations r
            JOIN profiles p ON r.receiver_id = p.user_id
            WHERE r.giver_id = $1
            ORDER BY r.created_at DESC
        `;
        return await this.db.query<UserRecommendation>(sql, [profileId]);
    }

    async getPendingRecommendations(profileId: string): Promise<UserRecommendation[]> {
        const sql = `
            SELECT r.*, p.display_name as giver_name, p.avatar_url as giver_avatar, p.username as giver_username
            FROM user_recommendations r
            JOIN profiles p ON r.giver_id = p.user_id
            WHERE r.receiver_id = $1 AND r.status = 'PENDING'
            ORDER BY r.created_at DESC
        `;
        return await this.db.query<UserRecommendation>(sql, [profileId]);
    }

    async updateStatus(id: string, status: RecommendationStatus): Promise<void> {
        const sql = `UPDATE user_recommendations SET status = $2 WHERE id = $1`;
        await this.db.query(sql, [id, status]);
    }

    async deleteRecommendation(id: string, profileId: string): Promise<void> {
        // Only giver or receiver can delete (or receiver can hide it)
        const sql = `DELETE FROM user_recommendations WHERE id = $1 AND (giver_id = $2 OR receiver_id = $2)`;
        await this.db.query(sql, [id, profileId]);
    }

    async findById(id: string): Promise<UserRecommendation | null> {
        const sql = `SELECT * FROM user_recommendations WHERE id = $1`;
        const result = await this.db.query<UserRecommendation>(sql, [id]);
        return result.length > 0 ? result[0] : null;
    }
}
