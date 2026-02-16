
export interface IDatabase {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
}
export interface ProfileData {
    user_id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    banner_url: string;
    website_url?: string;
    social_github?: string;
    social_twitter?: string;
    social_linkedin?: string;
    social_instagram?: string;
    social_facebook?: string;
    social_tiktok?: string;
    social_youtube?: string;
    social_whatsapp?: string;
    social_telegram?: string;
    social_snapchat?: string;
    social_discord?: string;
    social_twitch?: string;
    social_reddit?: string;
    social_other?: string;
    bio: string;
    location_coords?: {
        latitude: number;
        longitude: number;
    };
    location_name?: string;

}


export interface UpdateProfileDTO {
    user_id: string;
    username?: string | null;
    display_name?: string | null;
    bio?: string | null;
    location_coords?: {
        latitude: number;
        longitude: number;
    } | null;
    location_name?: string | null;
    avatar_url?: string | null;
    banner_url?: string | null;
    website_url?: string | null;
    social_github?: string | null;
    social_twitter?: string | null;
    social_linkedin?: string | null;
    social_instagram?: string | null;
    social_facebook?: string | null;
    social_tiktok?: string | null;
    social_youtube?: string | null;
    social_whatsapp?: string | null;
    social_telegram?: string | null;
    social_snapchat?: string | null;
    social_discord?: string | null;
    social_twitch?: string | null;
    social_reddit?: string | null;
    social_other?: string | null;
}

export interface ProfileResponse extends Omit<ProfileData, 'user_id'> {
    id: number;
}


