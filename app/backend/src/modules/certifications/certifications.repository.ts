import { DatabaseQueryError } from "../../errors/custom-errors";
import Logger from "../../infra/logger/winston";
import { CreateCertificationDTO, CertificationDTO, IDatabase, UpdateCertificationDTO } from "./certifications.types";

export class CertificationsRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger,
    ) { }

    async create(dto: CreateCertificationDTO): Promise<CertificationDTO | null> {
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
            const result = await this.db.query<CertificationDTO>(sql, params);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("CREATE_CERTIFICATION_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async getByProfileId(profileId: string): Promise<CertificationDTO[]> {
        try {
            const sql = `SELECT * FROM profile_certifications WHERE profile_id = $1 ORDER BY issue_date DESC`;
            return await this.db.query<CertificationDTO>(sql, [profileId]);
        } catch (error) {
            throw new DatabaseQueryError("GET_CERTIFICATIONS_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async update(id: string, dto: UpdateCertificationDTO): Promise<CertificationDTO | null> {
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
            const result = await this.db.query<CertificationDTO>(sql, params);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("UPDATE_CERTIFICATION_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const sql = `DELETE FROM profile_certifications WHERE id = $1`;
            await this.db.query(sql, [id]);
            return true;
        } catch (error) {
            throw new DatabaseQueryError("DELETE_CERTIFICATION_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
}
