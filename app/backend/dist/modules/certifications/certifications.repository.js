"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificationsRepository = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
class CertificationsRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async create(dto) {
        try {
            const sql = `
                INSERT INTO profile_certifications (
                    profile_id, name, issuing_organization, issue_date, 
                    expiration_date, credential_id, credential_url
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *;
            `;
            const params = [
                dto.profile_id, dto.name, dto.issuing_organization,
                dto.issue_date, dto.expiration_date, dto.credential_id, dto.credential_url
            ];
            const result = await this.db.query(sql, params);
            return result.length > 0 ? result[0] : null;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("CREATE_CERTIFICATION_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    async getByProfileId(profileId) {
        try {
            const sql = `SELECT * FROM profile_certifications WHERE profile_id = $1 ORDER BY issue_date DESC`;
            return await this.db.query(sql, [profileId]);
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("GET_CERTIFICATIONS_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    async update(id, dto) {
        try {
            const sql = `
                UPDATE profile_certifications 
                SET name = COALESCE($1, name), 
                    issuing_organization = COALESCE($2, issuing_organization),
                    issue_date = $3,
                    expiration_date = $4,
                    credential_id = $5,
                    credential_url = $6,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $7
                RETURNING *;
            `;
            const params = [
                dto.name, dto.issuing_organization, dto.issue_date,
                dto.expiration_date, dto.credential_id, dto.credential_url, id
            ];
            const result = await this.db.query(sql, params);
            return result.length > 0 ? result[0] : null;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("UPDATE_CERTIFICATION_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    async delete(id) {
        try {
            const sql = `DELETE FROM profile_certifications WHERE id = $1`;
            await this.db.query(sql, [id]);
            return true;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("DELETE_CERTIFICATION_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
}
exports.CertificationsRepository = CertificationsRepository;
//# sourceMappingURL=certifications.repository.js.map