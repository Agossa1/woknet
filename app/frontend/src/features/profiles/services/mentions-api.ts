import { api } from "@/src/features/api/apiClients";
import { ProfileData } from "@/src/features/profiles/services/profile-types";

export interface MentionSearchResponse {
    success: boolean;
    data: ProfileData[];
}

export const mentionsApi = {
    searchUsers: async (query: string): Promise<ProfileData[]> => {
        const response = await api.get<MentionSearchResponse>(`/profiles/search?query=${query}`);
        return response.data;
    }
};
