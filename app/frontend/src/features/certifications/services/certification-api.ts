import { ApiClient, api } from "../../api/apiClients";
import { CreateCertificationDTO, Certification, UpdateCertificationDTO } from "./certification-types";

export class CertificationServices {
    private readonly BASE_PATH = "/certifications";

    constructor(private apiClient: ApiClient) { }

    public async getProfileCertifications(profileId: string) {
        const response = await this.apiClient.get<{ success: boolean; data: Certification[] }>(
            `${this.BASE_PATH}/profile/${profileId}`
        );
        return response.data;
    }

    public async add(dto: CreateCertificationDTO) {
        const response = await this.apiClient.post<{ success: boolean; data: Certification }>(
            this.BASE_PATH,
            dto
        );
        return response.data;
    }

    public async update(id: string, dto: UpdateCertificationDTO) {
        const response = await this.apiClient.put<{ success: boolean; data: Certification }>(
            `${this.BASE_PATH}/${id}`,
            dto
        );
        return response.data;
    }

    public async remove(id: string) {
        return this.apiClient.delete<{ success: boolean }>(
            `${this.BASE_PATH}/${id}`
        );
    }
}

export const certificationApi = new CertificationServices(api);
