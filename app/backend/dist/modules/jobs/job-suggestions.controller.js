"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobSuggestionsController = void 0;
const AsyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
class JobSuggestionsController {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
        // Get job title suggestions with optional search
        this.getJobTitles = AsyncHandler(async (req, res) => {
            const search = req.query.search || '';
            const category = req.query.category;
            const limit = Math.min(Number(req.query.limit) || 20, 50);
            let query = `
            SELECT id, title, category, popularity
            FROM job_titles
            WHERE is_active = true
        `;
            const params = [];
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
            const result = await this.db.query(query, params);
            return res.json({
                success: true,
                data: result,
            });
        });
        // Get work location suggestions with optional search
        this.getWorkLocations = AsyncHandler(async (req, res) => {
            const search = req.query.search || '';
            const country = req.query.country;
            const limit = Math.min(Number(req.query.limit) || 20, 50);
            let query = `
            SELECT id, city, region, country, country_code, full_location, popularity
            FROM work_locations
            WHERE is_active = true
        `;
            const params = [];
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
            const result = await this.db.query(query, params);
            return res.json({
                success: true,
                data: result,
            });
        });
        // Get job categories
        this.getCategories = AsyncHandler(async (req, res) => {
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
}
exports.JobSuggestionsController = JobSuggestionsController;
//# sourceMappingURL=job-suggestions.controller.js.map