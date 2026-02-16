import { IDatabase } from "../auth/auth.types";
import Logger from "../../infra/logger/winston";
import { DatabaseQueryError } from "../../errors/custom-errors";
import { Like, LikeDTO } from "./likes.types";

export interface ILikesRepository {
    addLike(dto: LikeDTO): Promise<boolean>;
    removeLike(dto: LikeDTO): Promise<boolean>;
    isLiked(dto: LikeDTO): Promise<boolean>;
    getPostLikes(postId: string): Promise<Like[]>;
    addCommentLike(dto: LikeDTO): Promise<boolean>;
    removeCommentLike(dto: LikeDTO): Promise<boolean>;
    isCommentLiked(dto: LikeDTO): Promise<boolean>;
}

export class LikesRepository implements ILikesRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger
    ) { }

    async addLike(dto: LikeDTO): Promise<boolean> {
        try {
            const sql = `
                INSERT INTO likes (profile_id, post_id)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING
            `;
            await this.db.query(sql, [dto.profile_id, dto.post_id]);
            return true;
        } catch (error) {
            this.logger.instance.error(`[LikesRepository] Add like error: ${error}`);
            throw new DatabaseQueryError("ADD_LIKE_ERROR", error);
        }
    }

    async removeLike(dto: LikeDTO): Promise<boolean> {
        try {
            const sql = `DELETE FROM likes WHERE profile_id = $1 AND post_id = $2`;
            await this.db.query(sql, [dto.profile_id, dto.post_id]);
            return true;
        } catch (error) {
            throw new DatabaseQueryError("REMOVE_LIKE_ERROR", error);
        }
    }

    async isLiked(dto: LikeDTO): Promise<boolean> {
        try {
            const sql = `SELECT 1 FROM likes WHERE profile_id = $1 AND post_id = $2 LIMIT 1`;
            const result = await this.db.query(sql, [dto.profile_id, dto.post_id]);
            return result.length > 0;
        } catch (error) {
            throw new DatabaseQueryError("CHECK_LIKE_ERROR", error);
        }
    }

    async getPostLikes(postId: string): Promise<Like[]> {
        try {
            const sql = `SELECT * FROM likes WHERE post_id = $1`;
            return await this.db.query<Like>(sql, [postId]);
        } catch (error) {
            throw new DatabaseQueryError("GET_POST_LIKES_ERROR", error);
        }
    }

    async addCommentLike(dto: LikeDTO): Promise<boolean> {
        try {
            const sql = `
                INSERT INTO comment_likes (profile_id, comment_id)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING
            `;
            await this.db.query(sql, [dto.profile_id, dto.comment_id]);
            return true;
        } catch (error) {
            throw new DatabaseQueryError("ADD_COMMENT_LIKE_ERROR", error);
        }
    }

    async removeCommentLike(dto: LikeDTO): Promise<boolean> {
        try {
            const sql = `DELETE FROM comment_likes WHERE profile_id = $1 AND comment_id = $2`;
            await this.db.query(sql, [dto.profile_id, dto.comment_id]);
            return true;
        } catch (error) {
            throw new DatabaseQueryError("REMOVE_COMMENT_LIKE_ERROR", error);
        }
    }

    async isCommentLiked(dto: LikeDTO): Promise<boolean> {
        try {
            const sql = `SELECT 1 FROM comment_likes WHERE profile_id = $1 AND comment_id = $2 LIMIT 1`;
            const result = await this.db.query(sql, [dto.profile_id, dto.comment_id]);
            return result.length > 0;
        } catch (error) {
            throw new DatabaseQueryError("CHECK_COMMENT_LIKE_ERROR", error);
        }
    }
}
