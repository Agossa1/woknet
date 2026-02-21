"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharesRepository = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
class SharesRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async create(dto) {
        try {
            // 1. Create share entry
            const shareSql = `
                INSERT INTO shares (profile_id, post_id, caption)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const result = await this.db.query(shareSql, [
                dto.profile_id,
                dto.post_id,
                dto.caption || null
            ]);
            // 2. Increment shares_count in posts table
            await this.db.query(`
                UPDATE posts 
                SET shares_count = shares_count + 1 
                WHERE id = $1
            `, [dto.post_id]);
            return result[0];
        }
        catch (error) {
            this.logger.instance.error(`[SharesRepository] Create share error: ${error}`);
            throw new custom_errors_1.DatabaseQueryError("CREATE_SHARE_ERROR", error);
        }
    }
    async findByPostAndProfile(postId, profileId) {
        try {
            const sql = `SELECT * FROM shares WHERE post_id = $1 AND profile_id = $2`;
            const result = await this.db.query(sql, [postId, profileId]);
            return result.length > 0 ? result[0] : null;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("FIND_SHARE_ERROR", error);
        }
    }
    async delete(id) {
        try {
            // Get post_id first to decrement count
            const share = await this.db.query(`SELECT post_id FROM shares WHERE id = $1`, [id]);
            if (share.length === 0)
                return false;
            await this.db.query(`DELETE FROM shares WHERE id = $1`, [id]);
            await this.db.query(`
                UPDATE posts 
                SET shares_count = GREATEST(0, shares_count - 1) 
                WHERE id = $1
            `, [share[0].post_id]);
            return true;
        }
        catch (error) {
            this.logger.instance.error(`[SharesRepository] Delete share error: ${error}`);
            return false;
        }
    }
    async findPostById(id) {
        try {
            const sql = `SELECT profile_id FROM posts WHERE id = $1`;
            const result = await this.db.query(sql, [id]);
            return result.length > 0 ? result[0] : null;
        }
        catch (error) {
            return null;
        }
    }
}
exports.SharesRepository = SharesRepository;
//# sourceMappingURL=shares.repository.js.map