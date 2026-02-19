 
import { IDatabase } from '../profiles/profiles.types';
import Logger from '../../infra/logger/winston';
import { Job, CreateJobDTO, UpdateJobDTO } from './jobs.types';
import { validate as isUuid } from 'uuid';  

export class JobsRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger
    ) { }

    /**
     * Sécurité : Validation systématique des UUID
     */
    private validateUuid(id: string, context: string): void {
        if (!isUuid(id)) {
            this.logger.instance.error(`[JobsRepository] Invalid UUID format in ${context}: ${id}`);
            throw new Error(`Invalid identifier format for ${context}`);
        }
    }
 private generateSlug(title: string): string {
        const baseSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .slice(0, 50);

        const uniqueSuffix = Date.now().toString(36).slice(-6);
        return `${baseSlug}-${uniqueSuffix}`;
    }
    
    async createJob(dto: CreateJobDTO): Promise<Job> {
        try {
            const slug = this.generateSlug(dto.title);

            const sql = `
                INSERT INTO jobs (
                    company_id, title, slug, description, requirements, location,
                    work_type, salary_min, salary_max, currency, status, is_remote, application_url
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *
            `;

            const result = await this.db.query<Job>(sql, [
                dto.company_id, dto.title, slug,
                dto.description ?? null, dto.requirements ?? null, dto.location ?? null,
                dto.work_type ?? 'full-time', dto.salary_min ?? null, dto.salary_max ?? null,
                dto.currency ?? 'EUR', dto.status ?? 'draft', dto.is_remote ?? false,
                dto.application_url ?? null,
            ]);

            return result[0];
        } catch (error) {
            this.logger.instance.error(`[JobsRepository] Failed to create job: ${error}`);
            throw error;
        }
    }

    async updateJob(id: string, dto: UpdateJobDTO): Promise<Job> {
        this.validateUuid(id, 'updateJob');

        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        // Sécurité : Whitelist stricte des champs modifiables
        const allowedFields: (keyof UpdateJobDTO)[] = [
            'title', 'description', 'requirements', 'location', 'work_type',
            'salary_min', 'salary_max', 'currency', 'status', 'is_remote', 'application_url'
        ];

        for (const field of allowedFields) {
            if (dto[field] !== undefined) {
                fields.push(`${field} = $${paramIndex}`);
                values.push(dto[field]);
                paramIndex++;
            }
        }

        if (fields.length === 0) throw new Error("No fields to update");

        values.push(id); // L'ID est toujours le dernier paramètre
        const sql = `
            UPDATE jobs
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramIndex} AND deleted_at IS NULL
            RETURNING *
        `;

        const result = await this.db.query<Job>(sql, values);
        if (result.length === 0) throw new Error("Job not found or unauthorized");
        
        return result[0];
    }

    /**
     * Version corrigée et sécurisée du Matching Score
     */
    async getMatchingScore(jobId: string, userId: string): Promise<{ match_percentage: number } | null> {
        this.validateUuid(jobId, 'getMatchingScore:jobId');
        this.validateUuid(userId, 'getMatchingScore:userId');

        try {
            const sql = `
                SELECT 
                    (COUNT(job_tag)::float / NULLIF(array_length(j.tags, 1), 0)) * 100 as match_percentage
                FROM jobs j
                CROSS JOIN profiles p
                CROSS JOIN unnest(j.tags) AS job_tag
                WHERE j.id = $1 AND p.user_id = $2
                AND (
                    -- Vérification dans les skills structurés
                    EXISTS (
                        SELECT 1 FROM profile_skills ps
                        JOIN skills s ON ps.skill_id = s.id
                        WHERE ps.profile_id = p.user_id AND s.name ILIKE job_tag
                    )
                    OR 
                    -- Sécurité supplémentaire : vérification dans le tableau de skills texte si existant
                    job_tag = ANY(p.skills) 
                )
                GROUP BY j.tags
            `;

            const result = await this.db.query<{ match_percentage: number }>(sql, [jobId, userId]);
            return result.length > 0 ? result[0] : { match_percentage: 0 };
        } catch (error) {
            this.logger.instance.error(`[JobsRepository] Error calculating match score: ${error}`);
            return null;
        }
    }

    // src/modules/jobs/jobs.repository.ts (Suite)

async getJobById(id: string): Promise<Job | null> {
    this.validateUuid(id, 'getJobById');
    try {
        const sql = `SELECT * FROM jobs WHERE id = $1 AND deleted_at IS NULL`;
        const result = await this.db.query<Job>(sql, [id]);
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        this.logger.instance.error(`[JobsRepository] Error fetching job by ID ${id}: ${error}`);
        throw error;
    }
}

async getJobBySlug(slug: string): Promise<Job | null> {
    // Sécurité : Validation basique du format slug (alphanumérique et tirets)
    if (!/^[a-z0-9-]+$/.test(slug)) {
        throw new Error("Format de slug invalide");
    }

    try {
        const sql = `SELECT * FROM jobs WHERE slug = $1 AND deleted_at IS NULL`;
        const result = await this.db.query<Job>(sql, [slug]);
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        this.logger.instance.error(`[JobsRepository] Error fetching job by slug ${slug}: ${error}`);
        throw error;
    }
}

async getJobsByCompany(companyId: string): Promise<Job[]> {
    this.validateUuid(companyId, 'getJobsByCompany');
    try {
        const sql = `
            SELECT * FROM jobs 
            WHERE company_id = $1 AND deleted_at IS NULL
            ORDER BY created_at DESC
        `;
        return await this.db.query<Job>(sql, [companyId]);
    } catch (error) {
        this.logger.instance.error(`[JobsRepository] Error fetching jobs for company ${companyId}: ${error}`);
        throw error;
    }
}

async getAllJobs(filters?: { status?: string; is_remote?: boolean }): Promise<Job[]> {
    try {
        let sql = `SELECT * FROM jobs WHERE deleted_at IS NULL`;
        const params: any[] = [];

        // Sécurité : Whitelist des statuts autorisés
        const allowedStatuses = ['published', 'draft', 'closed'];
        if (filters?.status && allowedStatuses.includes(filters.status)) {
            params.push(filters.status);
            sql += ` AND status = $${params.length}`;
        }

        if (filters?.is_remote !== undefined) {
            params.push(!!filters.is_remote); // Force boolean
            sql += ` AND is_remote = $${params.length}`;
        }

        sql += ` ORDER BY created_at DESC`;
        return await this.db.query<Job>(sql, params);
    } catch (error) {
        this.logger.instance.error(`[JobsRepository] Error fetching all jobs: ${error}`);
        throw error;
    }
}

async deleteJob(id: string): Promise<void> {
    this.validateUuid(id, 'deleteJob');
    try {
        const sql = `
            UPDATE jobs 
            SET deleted_at = CURRENT_TIMESTAMP 
            WHERE id = $1 AND deleted_at IS NULL
        `;
        const result = await this.db.query(sql, [id]);
        // Note: On pourrait vérifier si une ligne a été impactée ici
    } catch (error) {
        this.logger.instance.error(`[JobsRepository] Error deleting job ${id}: ${error}`);
        throw error;
    }
}
     
}