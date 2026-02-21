"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperiencesRepository = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
class ExperiencesRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    // CREATE EXPERICES USERS
    async createExperiences(dto) {
        try {
            const sql = `
                INSERT INTO experiences (
                    title, company_name, type_job, type_place, country,
                    city, start_date, end_date, is_current, description, 
                    location, salary, currency, stack, profile_id
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
                ) RETURNING *;
            `;
            const params = [
                dto.title,
                dto.company_name,
                dto.type_job,
                dto.type_place,
                dto.country,
                dto.city,
                dto.start_date,
                dto.end_date,
                dto.is_current,
                dto.description,
                dto.location,
                dto.salary,
                dto.currency,
                dto.stack,
                dto.profile_id
            ];
            const result = await this.db.query(sql, params);
            return result.length > 0 ? result[0] : null;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("CREATE_EXPERIENCES_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    // GET EXPERIENCE BY ID
    async getExperienceById(id) {
        try {
            const sql = `SELECT * FROM experiences WHERE id = $1 AND deleted_at IS NULL LIMIT 1`;
            const result = await this.db.query(sql, [id]);
            return result.length > 0 ? result[0] : null;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("GET_EXPERIENCE_BY_ID_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    // Get ALL EXPERIENCES
    async getAllExperiences(profileId) {
        try {
            const sql = `SELECT * FROM experiences WHERE profile_id = $1 AND deleted_at IS NULL`;
            const result = await this.db.query(sql, [profileId]);
            return result.length > 0 ? result : [];
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("GET_ALL_EXPERIENCES_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    // UPDATE EXPERIECES
    async updateExperiences(id, dto) {
        try {
            const sql = `UPDATE experiences SET title = $1, company_name = $2, type_job = $3,
                        type_place = $4, country = $5, city = $6, start_date = $7,
                        end_date = $8, is_current = $9, description = $10, location = $11, 
                        salary = $12, currency = $13, stack = $14, profile_id = $15 
                        WHERE id = $16
                        RETURNING *`;
            const params = [
                dto.title,
                dto.company_name,
                dto.type_job,
                dto.type_place,
                dto.country,
                dto.city,
                dto.start_date,
                dto.end_date,
                dto.is_current,
                dto.description,
                dto.location,
                dto.salary,
                dto.currency,
                dto.stack,
                dto.profile_id,
                id
            ];
            const result = await this.db.query(sql, params);
            return result.length > 0 ? result[0] : null;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("UPDATE_EXPERIENCES_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    // DELETE EXPERIENCES
    async deleteExperiences(id) {
        try {
            const sql = `UPDATE experiences SET deleted_at = NOW() WHERE id = $1 RETURNING *`;
            const result = await this.db.query(sql, [id]);
            return result.length > 0 ? result[0] : null;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("DELETE_EXPERIENCES_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
}
exports.ExperiencesRepository = ExperiencesRepository;
//# sourceMappingURL=experiences.repository.js.map