import { IDatabase } from "../auth/auth.types";
import Logger from "../../infra/logger/winston";
import { DatabaseQueryError } from "../../errors/custom-errors";
import { SavedPost, ToggleSavePostDTO } from "./saved-posts.types";

export interface ISavedPostsRepository {
    toggle(dto: ToggleSavePostDTO): Promise<{ saved: boolean }>;
    findAllByProfileId(profileId: string): Promise<SavedPost[]>;
    isSaved(profileId: string, postId: string): Promise<boolean>;
}

export class SavedPostsRepository implements ISavedPostsRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger
    ) { }

    async toggle(dto: ToggleSavePostDTO): Promise<{ saved: boolean }> {
        try {
            // Check if already saved
            const existing = await this.db.query(
                `SELECT id FROM saved_posts WHERE profile_id = $1 AND post_id = $2`,
                [dto.profile_id, dto.post_id]
            );

            if (existing.length > 0) {
                // Remove if exists
                await this.db.query(
                    `DELETE FROM saved_posts WHERE profile_id = $1 AND post_id = $2`,
                    [dto.profile_id, dto.post_id]
                );
                return { saved: false };
            } else {
                // Add if not exists
                await this.db.query(
                    `INSERT INTO saved_posts (profile_id, post_id) VALUES ($1, $2)`,
                    [dto.profile_id, dto.post_id]
                );
                return { saved: true };
            }
        } catch (error) {
            this.logger.instance.error(`[SavedPostsRepository] Toggle error: ${error}`);
            throw new DatabaseQueryError("TOGGLE_SAVE_POST_ERROR", error);
        }
    }

    async findAllByProfileId(profileId: string): Promise<SavedPost[]> {
        try {
            const sql = `
                SELECT 
                    sp.*,
                    p.content, p.type, p.media_url, p.media_urls, p.created_at as post_created_at,
                    pr.display_name, pr.avatar_url, u.full_name
                FROM saved_posts sp
                JOIN posts p ON sp.post_id = p.id
                JOIN profiles pr ON p.profile_id = pr.user_id
                JOIN users u ON pr.user_id = u.id
                WHERE sp.profile_id = $1
                ORDER BY sp.created_at DESC
            `;
            return await this.db.query<SavedPost>(sql, [profileId]);
        } catch (error) {
            throw new DatabaseQueryError("FIND_SAVED_POSTS_ERROR", error);
        }
    }

    async isSaved(profileId: string, postId: string): Promise<boolean> {
        try {
            const result = await this.db.query(
                `SELECT 1 FROM saved_posts WHERE profile_id = $1 AND post_id = $2`,
                [profileId, postId]
            );
            return result.length > 0;
        } catch (error) {
            return false;
        }
    }
}
