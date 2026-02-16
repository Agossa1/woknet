import { ApiClient, api } from "../../api/apiClients";
import { Education, CreateEducationDTO, UpdateEducationDTO } from "./education-types";

export class EducationServices {
    private readonly BASE_PATH = "/educations"

    constructor(private apiClient: ApiClient) { }

    public async getEducationById(id: string) {
        return this.apiClient.get<{ success: boolean; data: Education }>(
            `${this.BASE_PATH}/${id}`
        );
    }

    public async getEducationsByProfileId(profileId: string) {
        return this.apiClient.get<{ success: boolean; data: Education[] }>(
            `${this.BASE_PATH}/profile/${profileId}`
        );
    }

    public async createEducation(dto: CreateEducationDTO) {
        return this.apiClient.post<{ success: boolean; message: string; data: Education }>(
            this.BASE_PATH,
            dto
        );
    }

    public async updateEducation(id: string, dto: UpdateEducationDTO) {
        return this.apiClient.put<{ success: boolean; message: string; data: Education }>(
            `${this.BASE_PATH}/${id}`,
            dto
        );
    }

    public async deleteEducation(id: string) {
        return this.apiClient.delete<{ success: boolean; message: string }>(
            `${this.BASE_PATH}/${id}`
        );
    }
}

export const educationServices = new EducationServices(api);
