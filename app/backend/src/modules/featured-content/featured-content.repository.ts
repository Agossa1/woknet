import { DatabaseQueryError } from "../../errors/custom-errors";
import Logger from "../../infra/logger/winston";
import { CreateFeaturedContentDTO, FeaturedContentDTO, IDatabase, UpdateFeaturedContentDTO } from "./featured-content.types";

export class FeaturedContentRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger,
    ) { }

    async create(dto: CreateFeaturedContentDTO): Promise<FeaturedContentDTO | null> {
        try {
            const sql = `
                INSERT INTO profile_featured_content (
                    profile_id, type, target_id, title, 
                    description, thumbnail_url, external_url, order_index
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *;
            `;
            const params = [
                dto.profile_id, dto.type, dto.target_id, dto.title,
                dto.description, dto.thumbnail_url, dto.external_url, dto.order_index
            ];
            const result = await this.db.query<FeaturedContentDTO>(sql, params);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("CREATE_FEATURED_CONTENT_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async getByProfileId(profileId: string): Promise<FeaturedContentDTO[]> {
        try {
            const sql = `SELECT * FROM profile_featured_content WHERE profile_id = $1 ORDER BY order_index ASC, created_at DESC`;
            return await this.db.query<FeaturedContentDTO>(sql, [profileId]);
        } catch (error) {
            throw new DatabaseQueryError("GET_FEATURED_CONTENT_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async update(id: string, dto: UpdateFeaturedContentDTO): Promise<FeaturedContentDTO | null> {
        try {
            const sql = `
                UPDATE profile_featured_content 
                SET title = COALESCE($1, title), 
                    description = COALESCE($2, description),
                    thumbnail_url = COALESCE($3, thumbnail_url),
                    external_url = COALESCE($4, external_url),
                    order_index = COALESCE($5, order_index)
                WHERE id = $6
                RETURNING *;
            `;
            const params = [dto.title, dto.description, dto.thumbnail_url, dto.external_url, dto.order_index, id];
            const result = await this.db.query<FeaturedContentDTO>(sql, params);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("UPDATE_FEATURED_CONTENT_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const sql = `DELETE FROM profile_featured_content WHERE id = $1`;
            await this.db.query(sql, [id]);
            return true;
        } catch (error) {
            throw new DatabaseQueryError("DELETE_FEATURED_CONTENT_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
}
