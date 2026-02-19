import { ApiClient, api } from "../../api/apiClients";
import { RecommendationSignal, RecommendationResponse, ProfileSuggestion } from "./recommendations-types";

export class RecommendationsServices {
    private readonly BASE_PATH = "/recommendations";

    constructor(private apiClient: ApiClient) { }

    /**
     * Sends a tracking signal to the backend (view, click, like, etc.)
     */
    public async trackSignal(signal: RecommendationSignal): Promise<RecommendationResponse> {
        return this.apiClient.post<RecommendationResponse>(`${this.BASE_PATH}/track`, signal);
    }

    /**
     * Fetches profile suggestions based on the recommendation algorithm
     */
    public async getProfileSuggestions(limit: number = 10): Promise<ProfileSuggestion[]> {
        return this.apiClient.get<ProfileSuggestion[]>(`${this.BASE_PATH}/profiles?limit=${limit}`);
    }

    /**
     * Fetches job suggestions based on the user profile and signals
     */
    public async getJobSuggestions(limit: number = 10): Promise<any[]> {
        return this.apiClient.get<any[]>(`${this.BASE_PATH}/jobs?limit=${limit}`);
    }
}

export const recommendationsApi = new RecommendationsServices(api);
