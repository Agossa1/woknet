import { Request, Response } from "express";
import { SkillsServices } from "./skills.services";
import { SKILL_LEVEL } from "./skills.types";
import { InternalServerError, BadRequestError, NotFoundError } from "../../errors/custom-errors";

export class SkillsController {
    constructor(private readonly services: SkillsServices) { }

    // GET /api/skills?query=react
    async searchSkills(req: Request, res: Response): Promise<void> {
        const query = req.query.q as string;
        if (!query) {
            res.status(200).json([]);
            return;
        }
        try {
            const results = await this.services.searchSkills(query);
            res.status(200).json(results);
        } catch (error) {
            res.status(500).json({ error: "Failed to search skills" });
        }
    }

    // GET /api/profiles/:profileId/skills
    async getSkills(req: Request, res: Response): Promise<void> {
        const profileId = req.params.profileId as string;
        try {
            const skills = await this.services.getProfileSkills(profileId);
            res.status(200).json(skills);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch skills" });
        }
    }

    // POST /api/profiles/:profileId/skills
    async addSkill(req: Request, res: Response): Promise<void> {
        const profileId = req.params.profileId as string;
        const { skill_name, level } = req.body; // Expecting { skill_name: "Python", level: "EXPERT" }

        // Security check: Profile ID should match authenticated user (unless admin)
        // Access control happens in middleware usually, assuming req.user.id matches or is admin

        if (!skill_name) {
            throw new BadRequestError("Skill name is required");
        }

        try {
            const result = await this.services.addSkillToProfile(profileId, skill_name);
            // Optionally update level if different from default
            if (level) {
                // Update level here or modify service to accept it
                await this.services.updateSkillLevel(profileId, result.skill_id, level as SKILL_LEVEL);
            }
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ error: "Failed to add skill" });
        }
    }

    // DELETE /api/profiles/:profileId/skills/:skillId
    async removeSkill(req: Request, res: Response): Promise<void> {
        const profileId = req.params.profileId as string;
        const skillId = req.params.skillId as string;
        try {
            await this.services.removeSkillFromProfile(profileId, skillId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to remove skill" });
        }
    }

    // POST /api/profiles/:profileId/skills/:skillId/endorse
    async endorseSkill(req: Request, res: Response): Promise<void> {
        const profileId = req.params.profileId as string;
        const skillId = req.params.skillId as string;
        const endorserId = (req as any).user.id; // From Auth Middleware

        try {
            await this.services.endorseSkill(profileId, skillId, endorserId);
            res.status(200).json({ message: "Skill endorsed successfully" });
        } catch (error: any) {
            if (error.statusCode) res.status(error.statusCode).json({ message: error.message });
            else res.status(500).json({ error: "Failed to endorse skill" });
        }
    }

    // DELETE /api/profiles/:profileId/skills/:skillId/endorse
    async removeEndorsement(req: Request, res: Response): Promise<void> {
        const profileId = req.params.profileId as string;
        const skillId = req.params.skillId as string;
        const endorserId = (req as any).user.id;

        try {
            await this.services.removeEndorsement(profileId, skillId, endorserId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to remove endorsement" });
        }
    }
}
