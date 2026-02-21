"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillsServices = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
const skills_types_1 = require("./skills.types");
class SkillsServices {
    constructor(skillsRepository, logger) {
        this.skillsRepository = skillsRepository;
        this.logger = logger;
    }
    // ------------------------------------------------------------------
    // Use Cases: Skills Catalog
    // ------------------------------------------------------------------
    async searchSkills(query) {
        try {
            if (!query)
                return [];
            return await this.skillsRepository.searchSkills(query, 10);
        }
        catch (error) {
            this.logger.instance.error(`Error searching skills: ${error}`);
            throw new custom_errors_1.InternalServerError("Error searching skills");
        }
    }
    // ------------------------------------------------------------------
    // Use Cases: Profile Skills Management
    // ------------------------------------------------------------------
    async getProfileSkills(profileId) {
        try {
            return await this.skillsRepository.getProfileSkills(profileId);
        }
        catch (error) {
            this.logger.instance.error(`Error fetching profile skills: ${error}`);
            throw new custom_errors_1.InternalServerError("Error fetching profile skills");
        }
    }
    async addSkillToProfile(profileId, skillName) {
        try {
            // 1. Find or create the skill globally
            let skill = await this.skillsRepository.findSkillByName(skillName);
            if (!skill) {
                // If it doesn't exist, create it (User Generated Content)
                skill = await this.skillsRepository.createSkill(skillName, 'General'); // Default category
            }
            // 2. Associate with profile
            return await this.skillsRepository.addSkillToProfile(profileId, skill.id, skills_types_1.SKILL_LEVEL.INTERMEDIATE); // Default level
        }
        catch (error) {
            this.logger.instance.error(`Error adding skill to profile: ${error}`);
            throw new custom_errors_1.InternalServerError("Error adding skill");
        }
    }
    async removeSkillFromProfile(profileId, skillId) {
        try {
            await this.skillsRepository.removeSkillFromProfile(profileId, skillId);
        }
        catch (error) {
            this.logger.instance.error(`Error removing skill: ${error}`);
            throw new custom_errors_1.InternalServerError("Error removing skill");
        }
    }
    async updateSkillLevel(profileId, skillId, level) {
        try {
            const updated = await this.skillsRepository.updateSkillLevel(profileId, skillId, level);
            if (!updated) {
                throw new custom_errors_1.NotFoundError("Skill not linked to this profile");
            }
            return updated;
        }
        catch (error) {
            if (error instanceof custom_errors_1.NotFoundError)
                throw error;
            this.logger.instance.error(`Error updating skill level: ${error}`);
            throw new custom_errors_1.InternalServerError("Error updating skill level");
        }
    }
    // ------------------------------------------------------------------
    // Use Cases: Endorsements
    // ------------------------------------------------------------------
    async endorseSkill(profileId, skillId, endorserId) {
        try {
            // 1. Validation: Prevent self-endorsement
            if (profileId === endorserId) {
                throw new custom_errors_1.ConflictException("You cannot endorse your own skills");
            }
            // 2. Perform endorsement (Repository handles idempotency via UNIQUE constraint or we catch error)
            await this.skillsRepository.endorseSkill(profileId, skillId, endorserId);
        }
        catch (error) {
            if (error.code === '23505') { // Postgres UNIQUE constraint violation code
                throw new custom_errors_1.ConflictException("You have already endorsed this skill");
            }
            if (error instanceof custom_errors_1.ConflictException)
                throw error;
            this.logger.instance.error(`Error endorsing skill: ${error}`);
            throw new custom_errors_1.InternalServerError("Error endorsing skill");
        }
    }
    async removeEndorsement(profileId, skillId, endorserId) {
        try {
            await this.skillsRepository.removeEndorsement(profileId, skillId, endorserId);
        }
        catch (error) {
            this.logger.instance.error(`Error removing endorsement: ${error}`);
            throw new custom_errors_1.InternalServerError("Error removing endorsement");
        }
    }
    // ------------------------------------------------------------------
    // Categories
    // ------------------------------------------------------------------
    async createCategory(profileId, name) {
        return await this.skillsRepository.createCategory(profileId, name);
    }
    async getProfileCategories(profileId) {
        return await this.skillsRepository.getProfileCategories(profileId);
    }
    async deleteCategory(id) {
        await this.skillsRepository.deleteCategory(id);
    }
    async mapSkillToCategory(categoryId, skillId, profileId) {
        await this.skillsRepository.mapSkillToCategory(categoryId, skillId, profileId);
    }
    async unmapSkillFromCategory(categoryId, skillId) {
        await this.skillsRepository.unmapSkillFromCategory(categoryId, skillId);
    }
    async getSkillsByCategory(categoryId) {
        return await this.skillsRepository.getSkillsByCategory(categoryId);
    }
}
exports.SkillsServices = SkillsServices;
//# sourceMappingURL=skills.services.js.map