import { InternalServerError } from "../../errors/custom-errors";
import Logger from "../../infra/logger/winston";
import { Skill, ProfileSkill, SkillEndorsement, SKILL_LEVEL, AddProfileSkillDTO, IDatabase } from "./skills.types";

export class SkillsRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger
    ) { }

    // ------------------------------------------------------------------
    // Skills (Catalog)
    // ------------------------------------------------------------------

    // Find skill by name (using Trigram index implicitly via equality for now, but important for suggestions)
    async findSkillByName(name: string): Promise<Skill | null> {
        const sql = `SELECT * FROM skills WHERE LOWER(name) = LOWER($1) LIMIT 1`;
        const result = await this.db.query<Skill>(sql, [name]);
        return result.length > 0 ? result[0] : null;
    }

    // Full-text search for autocomplete
    async searchSkills(query: string, limit = 10): Promise<Skill[]> {
        try {
            // Utilizing the gin_trgm_ops index for efficient fuzzy search
            const sql = `
            SELECT * FROM skills 
            WHERE name ILIKE $1 
            ORDER BY similarity(name, $2) DESC 
            LIMIT $3
        `;
            // Use %query% for simple ILIKE matching
            const result = await this.db.query<Skill>(sql, [`%${query}%`, query, limit]);
            return result;
        } catch (error: any) {
            this.logger.error(`Failed to search skills: ${error}`);
            throw new InternalServerError("Failed to search skills");
        }
    }

    async createSkill(name: string, category: string = 'General'): Promise<Skill> {
        try {
            const sql = `INSERT INTO skills (name, category) VALUES ($1, $2) RETURNING *`;
            const result = await this.db.query<Skill>(sql, [name, category]);
            return result[0];
        } catch (error: any) {
            this.logger.error(`Failed to create skill: ${error}`);
            throw new InternalServerError("Failed to create skill");
        }
    }

    // ------------------------------------------------------------------
    // Profile Skills
    // ------------------------------------------------------------------

    async getProfileSkills(profileId: string): Promise<ProfileSkill[]> {
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
        const result = await this.db.query<ProfileSkill>(sql, [profileId]);
        return result;
       } catch (error: any) {
        this.logger.error(`Failed to get profile skills: ${error}`);
        throw new InternalServerError("Failed to get profile skills");
       }
    }

    async addSkillToProfile(profileId: string, skillId: string, level: SKILL_LEVEL = SKILL_LEVEL.INTERMEDIATE): Promise<ProfileSkill> {
        try {
            const sql = `
            INSERT INTO profile_skills (profile_id, skill_id, level) 
            VALUES ($1, $2, $3)
            ON CONFLICT (profile_id, skill_id) DO UPDATE 
            SET level = EXCLUDED.level
            RETURNING *
        `;
        const result = await this.db.query<ProfileSkill>(sql, [profileId, skillId, level]);
        return result[0];
        } catch (error: any) {
            this.logger.error(`Failed to add skill to profile: ${error}`);
            throw new InternalServerError("Failed to add skill to profile");
        }
    }

    async removeSkillFromProfile(profileId: string, skillId: string): Promise<void> {
        try {
            const sql = `DELETE FROM profile_skills WHERE profile_id = $1 AND skill_id = $2`;
            await this.db.query(sql, [profileId, skillId]);
        } catch (error: any) {
            this.logger.error(`Failed to remove skill from profile: ${error}`);
            throw new InternalServerError("Failed to remove skill from profile");
        }
    }

    async updateSkillLevel(profileId: string, skillId: string, level: SKILL_LEVEL): Promise<ProfileSkill | null> {
        try {
            const sql = `
            UPDATE profile_skills 
            SET level = $3
            WHERE profile_id = $1 AND skill_id = $2
            RETURNING *
        `;
        const result = await this.db.query<ProfileSkill>(sql, [profileId, skillId, level]);
        return result.length > 0 ? result[0] : null;
        } catch (error: any) {
            this.logger.error(`Failed to update skill level: ${error}`);
            throw new InternalServerError("Failed to update skill level");
        }
    }

    // ------------------------------------------------------------------
    // Endorsements
    // ------------------------------------------------------------------

    async endorseSkill(profileId: string, skillId: string, endorserId: string): Promise<SkillEndorsement> {
        try {
            // Step 1: Create the endorsement record
            const endorsementSql = `
            INSERT INTO skill_endorsements (profile_id, skill_id, endorser_id)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const endorsement = await this.db.query<SkillEndorsement>(endorsementSql, [profileId, skillId, endorserId]);

        // Step 2: Increment the counter on profile_skills
        const updateCountSql = `
            UPDATE profile_skills 
            SET endorsements_count = endorsements_count + 1
            WHERE profile_id = $1 AND skill_id = $2
        `;
        await this.db.query(updateCountSql, [profileId, skillId]);

        return endorsement[0];
        } catch (error: any) {
            this.logger.error(`Failed to endorse skill: ${error}`);
            throw new InternalServerError("Failed to endorse skill");
        }
    }

    async removeEndorsement(profileId: string, skillId: string, endorserId: string): Promise<void> {
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
        } catch (error: any) {
            this.logger.error(`Failed to remove endorsement: ${error}`);
            throw new InternalServerError("Failed to remove endorsement");
        }
    }
}
