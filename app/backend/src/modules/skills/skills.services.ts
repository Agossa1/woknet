import { SkillsRepository } from "./skills.repository";
import Logger from "../../infra/logger/winston";
import { InternalServerError, NotFoundError, ConflictException } from "../../errors/custom-errors";
import { AddProfileSkillDTO, SKILL_LEVEL, Skill, ProfileSkill } from "./skills.types";

export class SkillsServices {
    constructor(
        private readonly skillsRepository: SkillsRepository,
        private readonly logger: Logger
    ) { }

    // ------------------------------------------------------------------
    // Use Cases: Skills Catalog
    // ------------------------------------------------------------------

    async searchSkills(query: string): Promise<Skill[]> {
        try {
            if (!query) return [];
            return await this.skillsRepository.searchSkills(query, 10);
        } catch (error) {
            this.logger.instance.error(`Error searching skills: ${error}`);
            throw new InternalServerError("Error searching skills");
        }
    }

    // ------------------------------------------------------------------
    // Use Cases: Profile Skills Management
    // ------------------------------------------------------------------

    async getProfileSkills(profileId: string): Promise<ProfileSkill[]> {
        try {
            return await this.skillsRepository.getProfileSkills(profileId);
        } catch (error) {
            this.logger.instance.error(`Error fetching profile skills: ${error}`);
            throw new InternalServerError("Error fetching profile skills");
        }
    }

    async addSkillToProfile(profileId: string, skillName: string): Promise<ProfileSkill> {
        try {
            // 1. Find or create the skill globally
            let skill = await this.skillsRepository.findSkillByName(skillName);
            if (!skill) {
                // If it doesn't exist, create it (User Generated Content)
                skill = await this.skillsRepository.createSkill(skillName, 'General'); // Default category
            }

            // 2. Associate with profile
            return await this.skillsRepository.addSkillToProfile(profileId, skill.id, SKILL_LEVEL.INTERMEDIATE); // Default level
        } catch (error) {
            this.logger.instance.error(`Error adding skill to profile: ${error}`);
            throw new InternalServerError("Error adding skill");
        }
    }

    async removeSkillFromProfile(profileId: string, skillId: string): Promise<void> {
        try {
            await this.skillsRepository.removeSkillFromProfile(profileId, skillId);
        } catch (error) {
            this.logger.instance.error(`Error removing skill: ${error}`);
            throw new InternalServerError("Error removing skill");
        }
    }

    async updateSkillLevel(profileId: string, skillId: string, level: SKILL_LEVEL): Promise<ProfileSkill> {
        try {
            const updated = await this.skillsRepository.updateSkillLevel(profileId, skillId, level);
            if (!updated) {
                throw new NotFoundError("Skill not linked to this profile");
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.instance.error(`Error updating skill level: ${error}`);
            throw new InternalServerError("Error updating skill level");
        }
    }

    // ------------------------------------------------------------------
    // Use Cases: Endorsements
    // ------------------------------------------------------------------

    async endorseSkill(profileId: string, skillId: string, endorserId: string): Promise<void> {
        try {
            // 1. Validation: Prevent self-endorsement
            if (profileId === endorserId) {
                throw new ConflictException("You cannot endorse your own skills");
            }

            // 2. Perform endorsement (Repository handles idempotency via UNIQUE constraint or we catch error)
            await this.skillsRepository.endorseSkill(profileId, skillId, endorserId);
        } catch (error: any) {
            if (error.code === '23505') { // Postgres UNIQUE constraint violation code
                throw new ConflictException("You have already endorsed this skill");
            }
            if (error instanceof ConflictException) throw error;

            this.logger.instance.error(`Error endorsing skill: ${error}`);
            throw new InternalServerError("Error endorsing skill");
        }
    }

    async removeEndorsement(profileId: string, skillId: string, endorserId: string): Promise<void> {
        try {
            await this.skillsRepository.removeEndorsement(profileId, skillId, endorserId);
        } catch (error) {
            this.logger.instance.error(`Error removing endorsement: ${error}`);
            throw new InternalServerError("Error removing endorsement");
        }
    }
}
