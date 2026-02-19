import { DatabaseQueryError } from "../../errors/custom-errors";
import Logger from "../../infra/logger/winston";
import { CreateLanguageDTO, LanguageDTO, IDatabase, UpdateLanguageDTO } from "./languages.types";

export class LanguagesRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger,
    ) { }

    async createLanguage(dto: CreateLanguageDTO): Promise<LanguageDTO | null> {
        try {
            const sql = `
                INSERT INTO profile_languages (profile_id, name, proficiency)
                VALUES ($1, $2, $3)
                RETURNING *;
            `;
            const params = [dto.profile_id, dto.name, dto.proficiency];
            const result = await this.db.query<LanguageDTO>(sql, params);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("CREATE_LANGUAGE_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async getLanguagesByProfileId(profileId: string): Promise<LanguageDTO[]> {
        try {
            const sql = `SELECT * FROM profile_languages WHERE profile_id = $1 ORDER BY created_at ASC`;
            return await this.db.query<LanguageDTO>(sql, [profileId]);
        } catch (error) {
            throw new DatabaseQueryError("GET_LANGUAGES_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async updateLanguage(id: string, dto: UpdateLanguageDTO): Promise<LanguageDTO | null> {
        try {
            const sql = `
                UPDATE profile_languages 
                SET name = COALESCE($1, name), 
                    proficiency = COALESCE($2, proficiency),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $3
                RETURNING *;
            `;
            const params = [dto.name, dto.proficiency, id];
            const result = await this.db.query<LanguageDTO>(sql, params);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("UPDATE_LANGUAGE_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async deleteLanguage(id: string): Promise<boolean> {
        try {
            const sql = `DELETE FROM profile_languages WHERE id = $1`;
            await this.db.query(sql, [id]);
            return true;
        } catch (error) {
            throw new DatabaseQueryError("DELETE_LANGUAGE_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
}
