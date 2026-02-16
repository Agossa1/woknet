import { ApiClient, api } from "../../api/apiClients";
import { Experience, CreateExperienceDTO, UpdateExperienceDTO } from "./experience-types";

export class ExperienceServices {
    private readonly BASE_PATH = "/experiences"

    constructor(private apiClient: ApiClient) { }

    public async getExperienceById(id: string) {
        return this.apiClient.get<{ success: boolean; data: Experience }>(
            `${this.BASE_PATH}/${id}`
        );
    }

    public async getExperiencesByProfileId(profileId: string) {
        return this.apiClient.get<{ success: boolean; data: Experience[] }>(
            `${this.BASE_PATH}/profile/${profileId}`
        );
    }

    public async createExperience(dto: CreateExperienceDTO) {
        return this.apiClient.post<{ success: boolean; message: string; data: Experience }>(
            this.BASE_PATH,
            dto
        );
    }

    public async updateExperience(id: string, dto: UpdateExperienceDTO) {
        return this.apiClient.put<{ success: boolean; message: string; data: Experience }>(
            `${this.BASE_PATH}/${id}`,
            dto
        );
    }

    public async deleteExperience(id: string) {
        return this.apiClient.delete<{ success: boolean; message: string }>(
            `${this.BASE_PATH}/${id}`
        );
    }
}

export const experienceServices = new ExperienceServices(api);
