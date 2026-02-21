"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillsController = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
class SkillsController {
    constructor(services) {
        this.services = services;
    }
    // GET /api/skills?query=react
    async searchSkills(req, res) {
        const query = req.query.q;
        if (!query) {
            res.status(200).json([]);
            return;
        }
        try {
            const results = await this.services.searchSkills(query);
            res.status(200).json(results);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to search skills" });
        }
    }
    // GET /api/profiles/:profileId/skills
    async getSkills(req, res) {
        const profileId = req.params.profileId;
        try {
            const skills = await this.services.getProfileSkills(profileId);
            res.status(200).json(skills);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch skills" });
        }
    }
    // POST /api/profiles/:profileId/skills
    async addSkill(req, res) {
        const profileId = req.params.profileId;
        const { skill_name, level } = req.body; // Expecting { skill_name: "Python", level: "EXPERT" }
        // Security check: Profile ID should match authenticated user (unless admin)
        // Access control happens in middleware usually, assuming req.user.id matches or is admin
        if (!skill_name) {
            throw new custom_errors_1.BadRequestError("Skill name is required");
        }
        try {
            const result = await this.services.addSkillToProfile(profileId, skill_name);
            // Optionally update level if different from default
            if (level) {
                // Update level here or modify service to accept it
                await this.services.updateSkillLevel(profileId, result.skill_id, level);
            }
            res.status(201).json(result);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to add skill" });
        }
    }
    // DELETE /api/profiles/:profileId/skills/:skillId
    async removeSkill(req, res) {
        const profileId = req.params.profileId;
        const skillId = req.params.skillId;
        try {
            await this.services.removeSkillFromProfile(profileId, skillId);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: "Failed to remove skill" });
        }
    }
    // POST /api/profiles/:profileId/skills/:skillId/endorse
    async endorseSkill(req, res) {
        const profileId = req.params.profileId;
        const skillId = req.params.skillId;
        const endorserId = req.user.id; // From Auth Middleware
        try {
            await this.services.endorseSkill(profileId, skillId, endorserId);
            res.status(200).json({ message: "Skill endorsed successfully" });
        }
        catch (error) {
            if (error.statusCode)
                res.status(error.statusCode).json({ message: error.message });
            else
                res.status(500).json({ error: "Failed to endorse skill" });
        }
    }
    // DELETE /api/profiles/:profileId/skills/:skillId/endorse
    async removeEndorsement(req, res) {
        const profileId = req.params.profileId;
        const skillId = req.params.skillId;
        const endorserId = req.user.id;
        try {
            await this.services.removeEndorsement(profileId, skillId, endorserId);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: "Failed to remove endorsement" });
        }
    }
    // ------------------------------------------------------------------
    // Categories
    // ------------------------------------------------------------------
    async createCategory(req, res) {
        const profileId = req.params.profileId;
        const { name } = req.body;
        try {
            const result = await this.services.createCategory(profileId, name);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to create category" });
        }
    }
    async getCategories(req, res) {
        const profileId = req.params.profileId;
        try {
            const result = await this.services.getProfileCategories(profileId);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch categories" });
        }
    }
    async deleteCategory(req, res) {
        const id = req.params.id;
        try {
            await this.services.deleteCategory(id);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: "Failed to delete category" });
        }
    }
    async mapSkill(req, res) {
        const categoryId = req.params.categoryId;
        const { skill_id, profile_id } = req.body;
        try {
            await this.services.mapSkillToCategory(categoryId, skill_id, profile_id);
            res.status(200).json({ success: true });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to map skill" });
        }
    }
}
exports.SkillsController = SkillsController;
//# sourceMappingURL=skills.controller.js.map