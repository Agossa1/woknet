import { ApiClient, api } from "../../api/apiClients";
import { AddSkillDTO, ProfileSkill, Skill, SkillLevel } from "./skills-types";

class SkillsApi {
    private readonly BASE_PATH = "/skills"; // Public search
    private readonly PROFILES_PATH = "/profiles";

    constructor(private apiClient: ApiClient) { }

    // Public search for autocomplete
    public async searchSkills(query: string): Promise<Skill[]> {
        const url = `${this.BASE_PATH}/search?q=${encodeURIComponent(query)}`;
        return this.apiClient.get<Skill[]>(url);
    }

    // Add skill to profile
    public async addSkillToProfile(profileId: string, dto: AddSkillDTO): Promise<ProfileSkill> {
        return this.apiClient.post<ProfileSkill>(`${this.PROFILES_PATH}/${profileId}/skills`, dto);
    }

    // Remove skill from profile
    public async removeSkillFromProfile(profileId: string, skillId: string): Promise<void> {
        return this.apiClient.delete(`${this.PROFILES_PATH}/${profileId}/skills/${skillId}`);
    }

    // Endorse a skill
    public async endorseSkill(profileId: string, skillId: string): Promise<void> {
        return this.apiClient.post(`${this.PROFILES_PATH}/${profileId}/skills/${skillId}/endorse`, {});
    }

    // Remove endorsement
    public async removeEndorsement(profileId: string, skillId: string): Promise<void> {
        return this.apiClient.delete(`${this.PROFILES_PATH}/${profileId}/skills/${skillId}/endorse`);
    }

    // Get skills for a profile
    public async getProfileSkills(profileId: string): Promise<ProfileSkill[]> {
        return this.apiClient.get<ProfileSkill[]>(`${this.PROFILES_PATH}/${profileId}/skills`);
    }
}

export const skillsApi = new SkillsApi(api);
