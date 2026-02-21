"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguagesRepository = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
class LanguagesRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async createLanguage(dto) {
        try {
            const sql = `
                INSERT INTO profile_languages (profile_id, name, proficiency)
                VALUES ($1, $2, $3)
                RETURNING *;
            `;
            const params = [dto.profile_id, dto.name, dto.proficiency];
            const result = await this.db.query(sql, params);
            return result.length > 0 ? result[0] : null;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("CREATE_LANGUAGE_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    async getLanguagesByProfileId(profileId) {
        try {
            const sql = `SELECT * FROM profile_languages WHERE profile_id = $1 ORDER BY created_at ASC`;
            return await this.db.query(sql, [profileId]);
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("GET_LANGUAGES_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    async updateLanguage(id, dto) {
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
            const result = await this.db.query(sql, params);
            return result.length > 0 ? result[0] : null;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("UPDATE_LANGUAGE_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    async deleteLanguage(id) {
        try {
            const sql = `DELETE FROM profile_languages WHERE id = $1`;
            await this.db.query(sql, [id]);
            return true;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("DELETE_LANGUAGE_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
}
exports.LanguagesRepository = LanguagesRepository;
//# sourceMappingURL=languages.repository.js.map