import Logger from "../../infra/logger/winston";
import { User } from "../auth/auth.types";
import { IDatabase, ProfileData, UpdateProfileDTO } from "./profiles.types";




export class ProfilesRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger,
    ) { }

    async getProfileByUserId(userId: ProfileData): Promise<User | null> {
        try {
            const sql = `
                SELECT 
                    p.user_id, 
                    p.username, 
                    p.display_name, 
                    p.avatar_url, 
                    p.banner_url, 
                    p.bio, 
                    p.location_coords, 
                    p.location_name,
                    p.website AS website_url,
                    p.social_github,
                    p.social_twitter,
                    p.social_linkedin,
                    p.social_instagram,
                    p.social_facebook,
                    p.social_tiktok,
                    p.social_youtube,
                    p.social_whatsapp,
                    p.social_telegram,
                    p.social_snapchat,
                    p.social_discord,
                    p.social_twitch,
                    p.social_reddit,
                    p.social_other,
                    p.followers_count,
                    p.following_count,
                    p.updated_at,
                    u.full_name,
                    u.headline,
                    u.is_active,
                    u.created_at
                FROM profiles p
                JOIN users u ON p.user_id = u.id
                WHERE p.user_id = $1
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
            const updates: string[] = [];
            const params: any[] = [];
            let counter = 1;

            // Mapping des noms de champs frontend → backend
            const fieldMapping: Record<string, string> = {
                'website_url': 'website'
            };

            // On boucle sur les clés du DTO (sauf user_id)
            for (const [key, value] of Object.entries(userId)) {
                if (key !== 'user_id' && value !== undefined) {
                    // Utiliser le nom mappé ou le nom original
                    const dbColumnName = fieldMapping[key] || key;
                    updates.push(`${dbColumnName} = $${counter}`);
                    // Gestion spécifique pour le JSON
                    const finalValue = key === 'location_coords' && value ? JSON.stringify(value) : value;
                    params.push(finalValue);
                    counter++;
                }
            }

            if (updates.length === 0) throw new Error("No fields to update");

            // On ajoute le user_id en dernier paramètre pour le WHERE
            params.push(userId.user_id);
            const sql = `
            UPDATE profiles 
            SET ${updates.join(', ')} 
            WHERE user_id = $${counter} 
            RETURNING *`;

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


