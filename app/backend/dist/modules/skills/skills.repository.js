"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillsRepository = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
const skills_types_1 = require("./skills.types");
class SkillsRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    // ------------------------------------------------------------------
    // Skills (Catalog)
    // ------------------------------------------------------------------
    // Find skill by name (using Trigram index implicitly via equality for now, but important for suggestions)
    async findSkillByName(name) {
        const sql = `SELECT * FROM skills WHERE LOWER(name) = LOWER($1) LIMIT 1`;
        const result = await this.db.query(sql, [name]);
        return result.length > 0 ? result[0] : null;
    }
    // Full-text search for autocomplete
    async searchSkills(query, limit = 10) {
        try {
            // Utilizing the gin_trgm_ops index for efficient fuzzy search
            const sql = `
            SELECT * FROM skills 
            WHERE name ILIKE $1 
            ORDER BY similarity(name, $2) DESC 
            LIMIT $3
        `;
            // Use %query% for simple ILIKE matching
            const result = await this.db.query(sql, [`%${query}%`, query, limit]);
            return result;
        }
        catch (error) {
            this.logger.instance.error(`Failed to search skills: ${error}`);
            throw new custom_errors_1.InternalServerError("Failed to search skills");
        }
    }
    async createSkill(name, category = 'General') {
        try {
            const sql = `INSERT INTO skills (name, category) VALUES ($1, $2) RETURNING *`;
            const result = await this.db.query(sql, [name, category]);
            return result[0];
        }
        catch (error) {
            this.logger.instance.error(`Failed to create skill: ${error}`);
            throw new custom_errors_1.InternalServerError("Failed to create skill");
        }
    }
    // ------------------------------------------------------------------
    // Profile Skills
    // ------------------------------------------------------------------
    async getProfileSkills(profileId) {
        try {
            const sql = `
            SELECT 
                ps.*, 
                s.name as skill_name, 
                s.category as skill_category
            FROM profile_skills ps
            JOIN skills s ON ps.skill_id = s.id
            WHERE ps.profile_id = $1
            ORDER BY ps.endorsements_count DESC, s.name ASC
        `;
            const result = await this.db.query(sql, [profileId]);
            return result;
        }
        catch (error) {
            this.logger.instance.error(`Failed to get profile skills: ${error}`);
            throw new custom_errors_1.InternalServerError("Failed to get profile skills");
        }
    }
    async addSkillToProfile(profileId, skillId, level = skills_types_1.SKILL_LEVEL.INTERMEDIATE) {
        try {
            const sql = `
            INSERT INTO profile_skills (profile_id, skill_id, level) 
            VALUES ($1, $2, $3)
            ON CONFLICT (profile_id, skill_id) DO UPDATE 
            SET level = EXCLUDED.level
            RETURNING *
        `;
            const result = await this.db.query(sql, [profileId, skillId, level]);
            return result[0];
        }
        catch (error) {
            this.logger.instance.error(`Failed to add skill to profile: ${error}`);
            throw new custom_errors_1.InternalServerError("Failed to add skill to profile");
        }
    }
    async removeSkillFromProfile(profileId, skillId) {
        try {
            const sql = `DELETE FROM profile_skills WHERE profile_id = $1 AND skill_id = $2`;
            await this.db.query(sql, [profileId, skillId]);
        }
        catch (error) {
            this.logger.instance.error(`Failed to remove skill from profile: ${error}`);
            throw new custom_errors_1.InternalServerError("Failed to remove skill from profile");
        }
    }
    async updateSkillLevel(profileId, skillId, level) {
        try {
            const sql = `
            UPDATE profile_skills 
            SET level = $3
            WHERE profile_id = $1 AND skill_id = $2
            RETURNING *
        `;
            const result = await this.db.query(sql, [profileId, skillId, level]);
            return result.length > 0 ? result[0] : null;
        }
        catch (error) {
            this.logger.instance.error(`Failed to update skill level: ${error}`);
            throw new custom_errors_1.InternalServerError("Failed to update skill level");
        }
    }
    // ------------------------------------------------------------------
    // Endorsements
    // ------------------------------------------------------------------
    async endorseSkill(profileId, skillId, endorserId) {
        try {
            // Step 1: Create the endorsement record
            const endorsementSql = `
            INSERT INTO skill_endorsements (profile_id, skill_id, endorser_id)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
            const endorsement = await this.db.query(endorsementSql, [profileId, skillId, endorserId]);
            // Step 2: Increment the counter on profile_skills
            const updateCountSql = `
            UPDATE profile_skills 
            SET endorsements_count = endorsements_count + 1
            WHERE profile_id = $1 AND skill_id = $2
        `;
            await this.db.query(updateCountSql, [profileId, skillId]);
            return endorsement[0];
        }
        catch (error) {
            this.logger.instance.error(`Failed to endorse skill: ${error}`);
            throw new custom_errors_1.InternalServerError("Failed to endorse skill");
        }
    }
    async removeEndorsement(profileId, skillId, endorserId) {
        try {
            // Step 1: Delete endorsement
            const deleteSql = `
            DELETE FROM skill_endorsements 
            WHERE profile_id = $1 AND skill_id = $2 AND endorser_id = $3
        `;
            await this.db.query(deleteSql, [profileId, skillId, endorserId]);
            // Step 2: Decrement counter
            const updateCountSql = `
            UPDATE profile_skills 
            SET endorsements_count = GREATEST(endorsements_count - 1, 0)
            WHERE profile_id = $1 AND skill_id = $2
        `;
            await this.db.query(updateCountSql, [profileId, skillId]);
        }
        catch (error) {
            this.logger.instance.error(`Failed to remove endorsement: ${error}`);
            throw new custom_errors_1.InternalServerError("Failed to remove endorsement");
        }
    }
    // ------------------------------------------------------------------
    // Categories
    // ------------------------------------------------------------------
    async createCategory(profileId, name) {
        const sql = `INSERT INTO profile_skill_categories (profile_id, name) VALUES ($1, $2) RETURNING *`;
        const result = await this.db.query(sql, [profileId, name]);
        return result[0];
    }
    async getProfileCategories(profileId) {
        const sql = `SELECT * FROM profile_skill_categories WHERE profile_id = $1 ORDER BY name ASC`;
        return await this.db.query(sql, [profileId]);
    }
    async deleteCategory(id) {
        const sql = `DELETE FROM profile_skill_categories WHERE id = $1`;
        await this.db.query(sql, [id]);
    }
    async mapSkillToCategory(categoryId, skillId, profileId) {
        const sql = `
            INSERT INTO profile_skill_category_mapping (category_id, skill_id, profile_id)
            VALUES ($1, $2, $3)
            ON CONFLICT (category_id, skill_id) DO NOTHING
        `;
        await this.db.query(sql, [categoryId, skillId, profileId]);
    }
    async unmapSkillFromCategory(categoryId, skillId) {
        const sql = `DELETE FROM profile_skill_category_mapping WHERE category_id = $1 AND skill_id = $2`;
        await this.db.query(sql, [categoryId, skillId]);
    }
    async getSkillsByCategory(categoryId) {
        const sql = `
            SELECT s.* 
            FROM skills s
            JOIN profile_skill_category_mapping m ON s.id = m.skill_id
            WHERE m.category_id = $1
        `;
        return await this.db.query(sql, [categoryId]);
    }
}
exports.SkillsRepository = SkillsRepository;
//# sourceMappingURL=skills.repository.js.map