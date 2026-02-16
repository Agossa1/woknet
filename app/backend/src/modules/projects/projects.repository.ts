import { Database } from "../../config/databases/types";
import { CreateProjectDTO, ProjectDTO, UpdateProjectDTO, ProjectLinkType } from "./projects.types";
import { DatabaseQueryError } from "../../errors/custom-errors";

export class ProjectsRepository {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async createProject(dto: CreateProjectDTO): Promise<ProjectDTO | null> {
        try {
            const sql = `
                INSERT INTO projects (
                    profile_id, category_id, title, description,
                    presentation_url, link_platform, repository_url, thumbnail_url,
                    is_ongoing, start_date, completion_date
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *;
            `;
            const params: (string | number | boolean | Date | null | undefined)[] = [
                dto.profile_id,
                dto.category_id || null,
                dto.title,
                dto.description,
                dto.presentation_url,
                dto.link_platform || ProjectLinkType.OTHER,
                dto.repository_url,
                dto.thumbnail_url,
                dto.is_ongoing || false,
                dto.start_date,
                dto.completion_date
            ];
            const result = await this.db.query<ProjectDTO>(sql, params);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("CREATE_PROJECT_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async getProjectsByProfileId(profileId: string): Promise<ProjectDTO[]> {
        try {
            const sql = `SELECT * FROM projects WHERE profile_id = $1 ORDER BY COALESCE(completion_date, start_date) DESC;`; // Prioritize most recent
            const result = await this.db.query<ProjectDTO>(sql, [profileId]);
            return result;
        } catch (error) {
            throw new DatabaseQueryError("GET_PROJECTS_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async getProjectById(id: string): Promise<ProjectDTO | null> {
        try {
            const sql = `SELECT * FROM projects WHERE id = $1;`;
            const result = await this.db.query<ProjectDTO>(sql, [id]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("GET_PROJECT_BY_ID_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async updateProject(id: string, dto: UpdateProjectDTO): Promise<ProjectDTO | null> {
        try {
            const setClause = [];
            const params: (string | number | boolean | Date | null | undefined)[] = [id];
            let paramIndex = 2;

            if (dto.title !== undefined) {
                setClause.push(`title = $${paramIndex++}`);
                params.push(dto.title);
            }
            if (dto.description !== undefined) {
                setClause.push(`description = $${paramIndex++}`);
                params.push(dto.description || null);
            }
            if (dto.category_id !== undefined) {
                setClause.push(`category_id = $${paramIndex++}`);
                params.push(dto.category_id || null);
            }
            if (dto.presentation_url !== undefined) {
                setClause.push(`presentation_url = $${paramIndex++}`);
                params.push(dto.presentation_url || '');
            }
            if (dto.link_platform !== undefined) {
                setClause.push(`link_platform = $${paramIndex++}`);
                params.push(dto.link_platform);
            }
            if (dto.repository_url !== undefined) {
                setClause.push(`repository_url = $${paramIndex++}`);
                params.push(dto.repository_url || '');
            }
            if (dto.thumbnail_url !== undefined) {
                setClause.push(`thumbnail_url = $${paramIndex++}`);
                params.push(dto.thumbnail_url || '');
            }
            if (dto.is_ongoing !== undefined) {
                setClause.push(`is_ongoing = $${paramIndex++}`);
                params.push(dto.is_ongoing);
            }
            if (dto.start_date !== undefined) {
                setClause.push(`start_date = $${paramIndex++}`);
                params.push(dto.start_date);
            }
            if (dto.completion_date !== undefined) {
                setClause.push(`completion_date = $${paramIndex++}`);
                params.push(dto.completion_date || null);
            }

            // Always update updated_at
            setClause.push('updated_at = NOW()');

            if (setClause.length === 0) {
                return await this.getProjectById(id);
            }

            const sql = `UPDATE projects SET ${setClause.join(', ')} WHERE id = $1 RETURNING *;`;
            const result = await this.db.query<ProjectDTO>(sql, params);
            return result.length > 0 ? result[0] : null;

        } catch (error) {
            throw new DatabaseQueryError("UPDATE_PROJECT_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async deleteProject(id: string): Promise<boolean> {
        try {
            const sql = `DELETE FROM projects WHERE id = $1;`;
            await this.db.query(sql, [id]);
            return true;
        } catch (error) {
            throw new DatabaseQueryError("DELETE_PROJECT_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
}
