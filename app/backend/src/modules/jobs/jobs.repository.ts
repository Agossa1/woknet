import { IDatabase } from '../profiles/profiles.types';
import Logger from '../../infra/logger/winston';
import { Job, CreateJobDTO, UpdateJobDTO } from './jobs.types';

export class JobsRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger
    ) { }

    async createJob(dto: CreateJobDTO): Promise<Job> {
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
            dto.company_id,
            dto.title,
            slug,
            dto.description ?? null,
            dto.requirements ?? null,
            dto.location ?? null,
            dto.work_type ?? 'full-time',
            dto.salary_min ?? null,
            dto.salary_max ?? null,
            dto.currency ?? 'EUR',
            dto.status ?? 'draft',
            dto.is_remote ?? false,
            dto.application_url ?? null,
        ]);

        return result[0];
    }

    async getJobById(id: string): Promise<Job | null> {
        const sql = `SELECT * FROM jobs WHERE id = $1 AND deleted_at IS NULL`;
        const result = await this.db.query<Job>(sql, [id]);
        return result.length > 0 ? result[0] : null;
    }

    async getJobBySlug(slug: string): Promise<Job | null> {
        const sql = `SELECT * FROM jobs WHERE slug = $1 AND deleted_at IS NULL`;
        const result = await this.db.query<Job>(sql, [slug]);
        return result.length > 0 ? result[0] : null;
    }

    async getJobsByCompany(companyId: string): Promise<Job[]> {
        const sql = `
            SELECT * FROM jobs 
            WHERE company_id = $1 AND deleted_at IS NULL
            ORDER BY created_at DESC
        `;
        return await this.db.query<Job>(sql, [companyId]);
    }

    async getAllJobs(filters?: { status?: string; is_remote?: boolean }): Promise<Job[]> {
        let sql = `SELECT * FROM jobs WHERE deleted_at IS NULL`;
        const params: any[] = [];

        if (filters?.status) {
            params.push(filters.status);
            sql += ` AND status = $${params.length}`;
        }

        if (filters?.is_remote !== undefined) {
            params.push(filters.is_remote);
            sql += ` AND is_remote = $${params.length}`;
        }

        sql += ` ORDER BY created_at DESC`;
        return await this.db.query<Job>(sql, params);
    }

    async updateJob(id: string, dto: UpdateJobDTO): Promise<Job> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        // Dynamically build the update query
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

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const sql = `
            UPDATE jobs
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex} AND deleted_at IS NULL
            RETURNING *
        `;

        const result = await this.db.query<Job>(sql, values);
        if (result.length === 0) {
            throw new Error("Job not found or already deleted");
        }
        return result[0];
    }

    async deleteJob(id: string): Promise<void> {
        const sql = `
            UPDATE jobs
            SET deleted_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND deleted_at IS NULL
        `;
        await this.db.query(sql, [id]);
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
}
