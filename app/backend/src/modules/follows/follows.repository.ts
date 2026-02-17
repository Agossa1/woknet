import { IDatabase } from "../auth/auth.types";
import Logger from "../../infra/logger/winston";
import { DatabaseQueryError } from "../../errors/custom-errors";
import { Follow, FollowDTO, FollowerInfo } from "./follows.types";

export interface IFollowsRepository {
    follow(dto: FollowDTO): Promise<boolean>;
    unfollow(dto: FollowDTO): Promise<boolean>;
    isFollowing(dto: FollowDTO): Promise<boolean>;
    getFollowers(followingId: string, currentUserId?: string): Promise<FollowerInfo[]>;
    getFollowing(followerId: string, currentUserId?: string): Promise<FollowerInfo[]>;
    getFollowCounts(profileId: string): Promise<{ followers: number; following: number }>;
}

export class FollowsRepository implements IFollowsRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger
    ) { }

    async follow(dto: FollowDTO): Promise<boolean> {
        try {
            const sql = `
                INSERT INTO follows (follower_id, following_id)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING
            `;
            await this.db.query(sql, [dto.follower_id, dto.following_id]);
            return true;
        } catch (error) {
            this.logger.instance.error(`[FollowsRepository] Follow error: ${error}`);
            throw new DatabaseQueryError("FOLLOW_ERROR", error);
        }
    }

    async unfollow(dto: FollowDTO): Promise<boolean> {
        try {
            const sql = `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`;
            await this.db.query(sql, [dto.follower_id, dto.following_id]);
            return true;
        } catch (error) {
            this.logger.instance.error(`[FollowsRepository] Unfollow error: ${error}`);
            throw new DatabaseQueryError("UNFOLLOW_ERROR", error);
        }
    }

    async isFollowing(dto: FollowDTO): Promise<boolean> {
        try {
            const sql = `SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2 LIMIT 1`;
            const result = await this.db.query(sql, [dto.follower_id, dto.following_id]);
            return result.length > 0;
        } catch (error) {
            throw new DatabaseQueryError("IS_FOLLOWING_ERROR", error);
        }
    }

    async getFollowers(followingId: string, currentUserId?: string): Promise<FollowerInfo[]> {
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
            return await this.db.query<FollowerInfo>(sql, params);
        } catch (error) {
            throw new DatabaseQueryError("GET_FOLLOWERS_ERROR", error);
        }
    }

    async getFollowing(followerId: string, currentUserId?: string): Promise<FollowerInfo[]> {
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
            return await this.db.query<FollowerInfo>(sql, params);
        } catch (error) {
            throw new DatabaseQueryError("GET_FOLLOWING_ERROR", error);
        }
    }

    async getFollowCounts(profileId: string): Promise<{ followers: number; following: number }> {
        try {
            const sql = `
                SELECT followers_count as followers, following_count as following
                FROM profiles
                WHERE user_id = $1
            `;
            const result = await this.db.query<{ followers: number; following: number }>(sql, [profileId]);
            return result[0] || { followers: 0, following: 0 };
        } catch (error) {
            throw new DatabaseQueryError("GET_FOLLOW_COUNTS_ERROR", error);
        }
    }
}
