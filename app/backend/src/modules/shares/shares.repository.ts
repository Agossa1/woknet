import { IDatabase } from "../auth/auth.types";
import Logger from "../../infra/logger/winston";
import { DatabaseQueryError } from "../../errors/custom-errors";
import { Share, CreateShareDTO } from "./shares.types";

export class SharesRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger
    ) { }

    async create(dto: CreateShareDTO): Promise<Share> {
        try {
            // 1. Create share entry
            const shareSql = `
                INSERT INTO shares (profile_id, post_id, caption)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const result = await this.db.query<Share>(shareSql, [
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
        } catch (error) {
            this.logger.instance.error(`[SharesRepository] Create share error: ${error}`);
            throw new DatabaseQueryError("CREATE_SHARE_ERROR", error);
        }
    }

    async findByPostAndProfile(postId: string, profileId: string): Promise<Share | null> {
        try {
            const sql = `SELECT * FROM shares WHERE post_id = $1 AND profile_id = $2`;
            const result = await this.db.query<Share>(sql, [postId, profileId]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("FIND_SHARE_ERROR", error);
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            // Get post_id first to decrement count
            const share = await this.db.query<Share>(`SELECT post_id FROM shares WHERE id = $1`, [id]);
            if (share.length === 0) return false;

            await this.db.query(`DELETE FROM shares WHERE id = $1`, [id]);

            await this.db.query(`
                UPDATE posts 
                SET shares_count = GREATEST(0, shares_count - 1) 
                WHERE id = $1
            `, [share[0].post_id]);

            return true;
        } catch (error) {
            this.logger.instance.error(`[SharesRepository] Delete share error: ${error}`);
            return false;
        }
    }

    async findPostById(id: string): Promise<{ profile_id: string } | null> {
        try {
            const sql = `SELECT profile_id FROM posts WHERE id = $1`;
            const result = await this.db.query<{ profile_id: string }>(sql, [id]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            return null;
        }
    }
}
