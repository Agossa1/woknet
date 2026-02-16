import { ApiClient, api } from "../../api/apiClients";
import { ProfileData, UpdateProfileDTO } from "./profile-types";

export class ProfileServices {
    private readonly BASE_PATH = "/profiles"

    constructor(private apiClient: ApiClient) { }

    // Recuperer le profile de l'utilisateur
    public async getProfileUser(userId: string) {
        return this.apiClient.get<{ success: boolean, message: string; data: ProfileData }>(
            `${this.BASE_PATH}/get-profile/${userId}`
        )
    }

    // Mettre a jour le profile de l'utilisateur
    public async updateProfileUser(userId: string, dto: UpdateProfileDTO) {
        return this.apiClient.put<{ success: boolean, message: string; data: ProfileData }>(
            `${this.BASE_PATH}/update-profile/${userId}`,
            dto
        )
    }

    // Télécharger une image de profil ou de bannière
    public async uploadProfileImage(file: File, type: 'avatar' | 'banner') {
        console.log(`[ProfileServices] Starting upload for ${type}...`);
        const formData = new FormData();
        formData.append('type', type); // Append type BEFORE file
        formData.append('file', file);

        try {
            const response = await this.apiClient.post<{ success: boolean; data: { url: string } }>(
                `/uploads/profile-image`,
                formData
            );
            console.log(`[ProfileServices] Upload response:`, response);
            return response;
        } catch (error) {
            console.error(`[ProfileServices] Upload failed:`, error);
            throw error;
        }
    }
}

// Export instance for use in thunks
export const profileServices = new ProfileServices(api);    