import { DatabaseQueryError } from "../../errors/custom-errors";
import Logger from "../../infra/logger/winston";
import { CreateEducationsDTO, EducationsDTO, IDatabase, UpdateEducationDTO } from "./educations.types";

export class EducationsRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger,
    ) { }

    // CREATE EDUCATION
    async createEducation(dto: CreateEducationsDTO): Promise<EducationsDTO | null> {
        try {
            const sql = `
                INSERT INTO educations (
                    school_name, degree, field_of_study, start_date, end_date,
                    is_current, description, location, stack, profile_id
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
                ) RETURNING *;
            `;
            const params = [
                dto.school_name,
                dto.degree,
                dto.field_of_study,
                dto.start_date,
                dto.end_date,
                dto.is_current,
                dto.description,
                dto.location,
                dto.stack,
                dto.profile_id
            ];
            const result = await this.db.query<EducationsDTO>(sql, params);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("CREATE_EDUCATION_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    // GET EDUCATION BY ID
    async getEducationById(id: string): Promise<EducationsDTO | null> {
        try {
            const sql = `SELECT * FROM educations WHERE id = $1 AND deleted_at IS NULL LIMIT 1`;
            const result = await this.db.query<EducationsDTO>(sql, [id])
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("GET_EDUCATION_BY_ID_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    // GET ALL EDUCATIONS BY PROFILE ID
    async getAllEducations(profileId: string): Promise<EducationsDTO[]> {
        try {
            const sql = `SELECT * FROM educations WHERE profile_id = $1 AND deleted_at IS NULL ORDER BY start_date DESC`;
            const result = await this.db.query<EducationsDTO>(sql, [profileId])
            return result.length > 0 ? result : [];
        } catch (error) {
            throw new DatabaseQueryError("GET_ALL_EDUCATIONS_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    // UPDATE EDUCATION
    async updateEducation(id: string, dto: UpdateEducationDTO): Promise<EducationsDTO | null> {
        try {
            const sql = `
                UPDATE educations 
                SET school_name = $1, degree = $2, field_of_study = $3,
                    start_date = $4, end_date = $5, is_current = $6,
                    description = $7, location = $8, stack = $9,
                    updated_at = NOW()
                WHERE id = $10 AND deleted_at IS NULL
                RETURNING *
            `;
            const params = [
                dto.school_name,
                dto.degree,
                dto.field_of_study,
                dto.start_date,
                dto.end_date,
                dto.is_current,
                dto.description,
                dto.location,
                dto.stack,
                id
            ];
            const result = await this.db.query<EducationsDTO>(sql, params);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("UPDATE_EDUCATION_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    // DELETE EDUCATION (soft delete)
    async deleteEducation(id: string): Promise<EducationsDTO | null> {
        try {
            const sql = `UPDATE educations SET deleted_at = NOW() WHERE id = $1 RETURNING *`;
            const result = await this.db.query<EducationsDTO>(sql, [id])
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("DELETE_EDUCATION_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
}
