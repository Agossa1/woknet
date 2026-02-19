import { ApiClient, api } from "../../api/apiClients";
import { CreateLanguageDTO, Language, UpdateLanguageDTO } from "./language-types";

export class LanguageServices {
    private readonly BASE_PATH = "/languages";

    constructor(private apiClient: ApiClient) { }

    public async getProfileLanguages(profileId: string) {
        const response = await this.apiClient.get<{ success: boolean; data: Language[] }>(
            `${this.BASE_PATH}/profile/${profileId}`
        );
        return response.data;
    }

    public async addLanguage(dto: CreateLanguageDTO) {
        const response = await this.apiClient.post<{ success: boolean; data: Language }>(
            this.BASE_PATH,
            dto
        );
        return response.data;
    }

    public async updateLanguage(id: string, dto: UpdateLanguageDTO) {
        const response = await this.apiClient.put<{ success: boolean; data: Language }>(
            `${this.BASE_PATH}/${id}`,
            dto
        );
        return response.data;
    }

    public async deleteLanguage(id: string) {
        return this.apiClient.delete<{ success: boolean }>(
            `${this.BASE_PATH}/${id}`
        );
    }
}

export const languageApi = new LanguageServices(api);
