import { ApiClient, api } from "../../api/apiClients";
import { CreateFeaturedContentDTO, FeaturedContent, UpdateFeaturedContentDTO } from "./featured-types";

export class FeaturedContentServices {
    private readonly BASE_PATH = "/featured-content";

    constructor(private apiClient: ApiClient) { }

    public async getProfileFeatured(profileId: string) {
        const response = await this.apiClient.get<{ success: boolean; data: FeaturedContent[] }>(
            `${this.BASE_PATH}/profile/${profileId}`
        );
        return response.data;
    }

    public async add(dto: CreateFeaturedContentDTO) {
        const response = await this.apiClient.post<{ success: boolean; data: FeaturedContent }>(
            this.BASE_PATH,
            dto
        );
        return response.data;
    }

    public async update(id: string, dto: UpdateFeaturedContentDTO) {
        const response = await this.apiClient.put<{ success: boolean; data: FeaturedContent }>(
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

export const featuredApi = new FeaturedContentServices(api);
