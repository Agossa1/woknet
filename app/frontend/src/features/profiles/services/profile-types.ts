
export interface ProfileData {
    user_id: string;
    username: string;
    full_name?: string;
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
    is_active?: boolean;
    headline?: string;
    followers_count?: number;
    following_count?: number;
    created_at?: string | Date;
}


export interface UpdateProfileDTO {
    user_id: string;
    display_name?: string;
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
    bio?: string;
    location_coords?: {
        latitude: number;
        longitude: number;
    };
    location_name?: string;
    avatar_url?: string;
    banner_url?: string;
}

export interface ProfileResponse extends Omit<ProfileData, 'user_id'> {
    id: number;
}


