import Logger from "../../infra/logger/winston";
import { User } from "../auth/auth.types";
import { IDatabase, ProfileData, UpdateProfileDTO } from "./profiles.types";




export class ProfilesRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger,
    ) { }

    async getProfileByUserId(userId: string): Promise<User | null> {
        try {
            const sql = `
                SELECT 
                    user_id, username, display_name, avatar_url, banner_url, website as website_url, 
                    social_github, social_twitter, social_linkedin, 
                    social_instagram, social_facebook, social_tiktok, social_youtube, 
                    social_whatsapp, social_telegram, social_snapchat, social_discord, 
                    social_twitch, social_reddit, social_other,
                    bio, 
                    location_name,
                    followers_count, following_count,
                    CASE WHEN location_coords IS NOT NULL THEN 
                        json_build_object('longitude', location_coords[0], 'latitude', location_coords[1])
                    ELSE NULL END as location_coords
                FROM profiles 
                WHERE user_id = $1
            `;
            const results = await this.db.query<User>(sql, [userId]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            this.logger.instance.error("Error fetching profile by user ID", error);
            throw error;
        }
    }

    async updateProfile(userId: UpdateProfileDTO): Promise<User> {
        try {
            const sql = `UPDATE profiles SET display_name = COALESCE($1, display_name), bio = COALESCE(NULLIF($2, ''), bio), location_coords = COALESCE($3, location_coords), location_name = COALESCE($4, location_name), avatar_url = COALESCE($5, avatar_url), banner_url = COALESCE($6, banner_url), website = COALESCE($7, website), social_github = COALESCE($8, social_github), social_twitter = COALESCE($9, social_twitter), social_linkedin = COALESCE($10, social_linkedin), social_instagram = COALESCE($11, social_instagram), social_facebook = COALESCE($12, social_facebook), social_tiktok = COALESCE($13, social_tiktok), social_youtube = COALESCE($14, social_youtube), social_whatsapp = COALESCE($15, social_whatsapp), social_telegram = COALESCE($16, social_telegram), social_snapchat = COALESCE($17, social_snapchat), social_discord = COALESCE($18, social_discord), social_twitch = COALESCE($19, social_twitch), social_reddit = COALESCE($20, social_reddit), social_other = COALESCE($21, social_other) WHERE user_id = $22 RETURNING user_id, username, display_name, avatar_url, banner_url, website as website_url, social_github, social_twitter, social_linkedin, social_instagram, social_facebook, social_tiktok, social_youtube, social_whatsapp, social_telegram, social_snapchat, social_discord, social_twitch, social_reddit, social_other, bio, location_coords, location_name, followers_count, following_count`;
            const params = [
                userId.display_name,
                userId.bio,
                userId.location_coords ? `(${userId.location_coords.longitude},${userId.location_coords.latitude})` : null,
                userId.location_name,
                userId.avatar_url,
                userId.banner_url,
                userId.website_url,
                userId.social_github,
                userId.social_twitter,
                userId.social_linkedin,
                userId.social_instagram,
                userId.social_facebook,
                userId.social_tiktok,
                userId.social_youtube,
                userId.social_whatsapp,
                userId.social_telegram,
                userId.social_snapchat,
                userId.social_discord,
                userId.social_twitch,
                userId.social_reddit,
                userId.social_other,
                userId.user_id
            ];
            const results = await this.db.query<User>(sql, params);
            return results[0];
        } catch (error) {
            this.logger.instance.error("Error updating profile", error);
            throw error;
        }
    }
    async incrementFollowing(userId: string): Promise<void> {
        const sql = `UPDATE profiles SET following_count = following_count + 1 WHERE user_id = $1`;
        await this.db.query(sql, [userId]);
    }

    async decrementFollowing(userId: string): Promise<void> {
        const sql = `UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE user_id = $1`;
        await this.db.query(sql, [userId]);
    }

    async incrementFollowers(userId: string): Promise<void> {
        const sql = `UPDATE profiles SET followers_count = followers_count + 1 WHERE user_id = $1`;
        await this.db.query(sql, [userId]);
    }

    async decrementFollowers(userId: string): Promise<void> {
        const sql = `UPDATE profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE user_id = $1`;
        await this.db.query(sql, [userId]);
    }
}


