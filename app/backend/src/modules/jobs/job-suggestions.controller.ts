import { Request, Response, NextFunction } from "express";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";

const AsyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export class JobSuggestionsController {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger
    ) { }

    // Get job title suggestions with optional search
    getJobTitles = AsyncHandler(async (req: Request, res: Response) => {
        const search = (req.query.search as string) || '';
        const category = req.query.category as string;
        const limit = Math.min(Number(req.query.limit) || 20, 50);

        let query = `
            SELECT id, title, category, popularity
            FROM job_titles
            WHERE is_active = true
        `;
        const params: any[] = [];

        if (search) {
            params.push(`%${search}%`);
            query += ` AND title ILIKE $${params.length}`;
        }

        if (category) {
            params.push(category);
            query += ` AND category = $${params.length}`;
        }

        params.push(limit);
        query += ` ORDER BY popularity DESC, title ASC LIMIT $${params.length}`;

        const result = await this.db.query(query, params) as any;

        return res.json({
            success: true,
            data: result,
        });
    });

    // Get work location suggestions with optional search
    getWorkLocations = AsyncHandler(async (req: Request, res: Response) => {
        const search = (req.query.search as string) || '';
        const country = req.query.country as string;
        const limit = Math.min(Number(req.query.limit) || 20, 50);

        let query = `
            SELECT id, city, region, country, country_code, full_location, popularity
            FROM work_locations
            WHERE is_active = true
        `;
        const params: any[] = [];

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (city ILIKE $${params.length} OR full_location ILIKE $${params.length})`;
        }

        if (country) {
            params.push(country);
            query += ` AND country = $${params.length}`;
        }

        params.push(limit);
        query += ` ORDER BY popularity DESC, city ASC LIMIT $${params.length}`;

        const result = await this.db.query(query, params) as any;

        return res.json({
            success: true,
            data: result,
        });
    });

    // Get job categories
    getCategories = AsyncHandler(async (req: Request, res: Response) => {
        const query = `
            SELECT DISTINCT category, COUNT(*) as count
            FROM job_titles
            WHERE is_active = true AND category IS NOT NULL
            GROUP BY category
            ORDER BY count DESC, category ASC
        `;

        const result = await this.db.query(query);

        return res.json({
            success: true,
            data: result,
        });
    });
}
