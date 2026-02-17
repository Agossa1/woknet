import Logger from "../../infra/logger/winston";
import { IDatabase } from "../profiles/profiles.types";
import {
    Company,
    CreateCompanyDTO,
    UpdateCompanyDTO
} from "./companies.types";

export class CompaniesRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger,
    ) { }

    async createCompany(ownerId: string, dto: CreateCompanyDTO): Promise<Company> {
        const sql = `
            INSERT INTO companies (owner_id, name, slug, logo_url, banner_url, description, website_url, company_size, company_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const result = await this.db.query<Company>(sql, [
            ownerId,
            dto.name,
            dto.slug,
            dto.logo_url ?? null,
            dto.banner_url ?? null,
            dto.description ?? null,
            dto.website_url ?? null,
            dto.company_size ?? null,
            dto.company_type ?? null,
        ]);
        return result[0];
    }

    async getCompanies(userId: string): Promise<Company[]> {
        const sql = `
            SELECT * FROM companies 
            WHERE owner_id = $1 AND deleted_at IS NULL
            ORDER BY created_at DESC
        `;
        return await this.db.query<Company>(sql, [userId]);
    }

    async getCompanyById(id: string): Promise<Company | null> {
        const sql = `SELECT * FROM companies WHERE id = $1 AND deleted_at IS NULL`;
        const result = await this.db.query<Company>(sql, [id]);
        return result.length > 0 ? result[0] : null;
    }

    async getCompanyBySlug(slug: string): Promise<Company | null> {
        const sql = `SELECT * FROM companies WHERE slug = $1 AND deleted_at IS NULL`;
        const result = await this.db.query<Company>(sql, [slug]);
        return result.length > 0 ? result[0] : null;
    }

    async updateCompany(id: string, dto: UpdateCompanyDTO): Promise<Company> {
        const fields: string[] = [];
        const values: any[] = [];
        let index = 1;

        Object.entries(dto).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = $${index}`);
                values.push(value);
                index++;
            }
        });

        if (fields.length === 0) return (await this.getCompanyById(id))!;

        const sql = `
            UPDATE companies 
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${index}
            RETURNING *
        `;
        values.push(id);

        const result = await this.db.query<Company>(sql, values);
        return result[0];
    }

    async deleteCompany(id: string): Promise<void> {
        const sql = `UPDATE companies SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`;
        await this.db.query(sql, [id]);
    }
}
