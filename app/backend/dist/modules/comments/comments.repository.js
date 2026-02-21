"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsRepository = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
class CommentsRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async create(dto) {
        try {
            const sql = `
                WITH inserted AS (
                    INSERT INTO comments (post_id, profile_id, parent_id, content)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *
                )
                SELECT 
                    i.*, 
                    pr.username, pr.avatar_url, 
                    u.full_name, u.headline,
                    false as "isLiked"
                FROM inserted i
                JOIN profiles pr ON i.profile_id = pr.user_id
                JOIN users u ON pr.user_id = u.id
            `;
            const params = [
                dto.post_id,
                dto.profile_id,
                dto.parent_id || null,
                dto.content
            ];
            const result = await this.db.query(sql, params);
            return result[0];
        }
        catch (error) {
            this.logger.instance.error(`[CommentsRepository] Create comment error: ${error}`);
            throw new custom_errors_1.DatabaseQueryError("CREATE_COMMENT_ERROR", error);
        }
    }
    async findById(id, currentProfileId) {
        try {
            const sql = `
                SELECT 
                    c.*, 
                    pr.username, pr.avatar_url, 
                    u.full_name, u.headline,
                    EXISTS(SELECT 1 FROM comment_likes l WHERE l.comment_id = c.id AND l.profile_id = $2) as "isLiked"
                FROM comments c
                JOIN profiles pr ON c.profile_id = pr.user_id
                JOIN users u ON pr.user_id = u.id
                WHERE c.id = $1
            `;
            const result = await this.db.query(sql, [id, currentProfileId || null]);
            return result.length > 0 ? result[0] : null;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("FIND_COMMENT_BY_ID_ERROR", error);
        }
    }
    async findByPostId(postId, currentProfileId) {
        try {
            const sql = `
                SELECT 
                    c.*, 
                    pr.username, pr.avatar_url, 
                    u.full_name, u.headline,
                    EXISTS(SELECT 1 FROM comment_likes l WHERE l.comment_id = c.id AND l.profile_id = $2) as "isLiked"
                FROM comments c
                JOIN profiles pr ON c.profile_id = pr.user_id
                JOIN users u ON pr.user_id = u.id
                WHERE c.post_id = $1 AND c.parent_id IS NULL 
                ORDER BY c.created_at ASC
            `;
            return await this.db.query(sql, [postId, currentProfileId || null]);
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("FIND_COMMENTS_BY_POST_ERROR", error);
        }
    }
    async findReplies(parentId, currentProfileId) {
        try {
            const sql = `
                SELECT 
                    c.*, 
                    pr.username, pr.avatar_url, 
                    u.full_name, u.headline,
                    EXISTS(SELECT 1 FROM comment_likes l WHERE l.comment_id = c.id AND l.profile_id = $2) as "isLiked"
                FROM comments c
                JOIN profiles pr ON c.profile_id = pr.user_id
                JOIN users u ON pr.user_id = u.id
                WHERE c.parent_id = $1 
                ORDER BY c.created_at ASC
            `;
            return await this.db.query(sql, [parentId, currentProfileId || null]);
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("FIND_REPLIES_ERROR", error);
        }
    }
    async update(id, dto) {
        try {
            const sql = `
                UPDATE comments 
                SET content = $2, updated_at = NOW() 
                WHERE id = $1 
                RETURNING *
            `;
            const result = await this.db.query(sql, [id, dto.content]);
            return result[0];
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("UPDATE_COMMENT_ERROR", error);
        }
    }
    async delete(id) {
        try {
            const sql = `DELETE FROM comments WHERE id = $1`;
            await this.db.query(sql, [id]);
            return true;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("DELETE_COMMENT_ERROR", error);
        }
    }
    async incrementLikes(id) {
        try {
            const sql = `UPDATE comments SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count`;
            const result = await this.db.query(sql, [id]);
            return result[0].likes_count;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("INCREMENT_COMMENT_LIKES_ERROR", error);
        }
    }
    async decrementLikes(id) {
        try {
            const sql = `UPDATE comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1 RETURNING likes_count`;
            const result = await this.db.query(sql, [id]);
            return result[0].likes_count;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("DECREMENT_COMMENT_LIKES_ERROR", error);
        }
    }
    async incrementComments(id) {
        try {
            const sql = `UPDATE comments SET comments_count = comments_count + 1 WHERE id = $1 RETURNING comments_count`;
            const result = await this.db.query(sql, [id]);
            return result[0].comments_count;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("INCREMENT_COMMENT_REPLIES_ERROR", error);
        }
    }
    async decrementComments(id) {
        try {
            const sql = `UPDATE comments SET comments_count = GREATEST(0, comments_count - 1) WHERE id = $1 RETURNING comments_count`;
            const result = await this.db.query(sql, [id]);
            return result[0].comments_count;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("DECREMENT_COMMENT_REPLIES_ERROR", error);
        }
    }
}
exports.CommentsRepository = CommentsRepository;
//# sourceMappingURL=comments.repository.js.map