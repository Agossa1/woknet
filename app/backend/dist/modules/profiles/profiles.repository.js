"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilesRepository = void 0;
class ProfilesRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async getProfileByUserId(userId) {
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
            const results = await this.db.query(sql, [userId]);
            return results.length > 0 ? results[0] : null;
        }
        catch (error) {
            this.logger.instance.error("Error fetching profile by user ID", error);
            throw error;
        }
    }
    async updateProfile(userId) {
        try {
            const updates = [];
            const params = [];
            let counter = 1;
            // Mapping des noms de champs frontend → backend
            const fieldMapping = {
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
            if (updates.length === 0)
                throw new Error("No fields to update");
            // On ajoute le user_id en dernier paramètre pour le WHERE
            params.push(userId.user_id);
            const sql = `
            UPDATE profiles 
            SET ${updates.join(', ')} 
            WHERE user_id = $${counter} 
            RETURNING *`;
            const results = await this.db.query(sql, params);
            return results[0];
        }
        catch (error) {
            this.logger.instance.error("Error updating profile", error);
            throw error;
        }
    }
    async incrementFollowing(userId) {
        const sql = `UPDATE profiles SET following_count = following_count + 1 WHERE user_id = $1`;
        await this.db.query(sql, [userId]);
    }
    async decrementFollowing(userId) {
        const sql = `UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE user_id = $1`;
        await this.db.query(sql, [userId]);
    }
    async incrementFollowers(userId) {
        const sql = `UPDATE profiles SET followers_count = followers_count + 1 WHERE user_id = $1`;
        await this.db.query(sql, [userId]);
    }
    async decrementFollowers(userId) {
        const sql = `UPDATE profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE user_id = $1`;
        await this.db.query(sql, [userId]);
    }
    async searchProfiles(query, limit = 10) {
        try {
            const sql = `
                SELECT 
                    p.user_id, 
                    p.username, 
                    p.display_name, 
                    p.avatar_url,
                    u.full_name,
                    u.headline
                FROM profiles p
                JOIN users u ON p.user_id = u.id
                WHERE 
                    p.username ILIKE $1 OR 
                    p.display_name ILIKE $1 OR 
                    u.full_name ILIKE $1
                LIMIT $2
            `;
            return await this.db.query(sql, [`%${query}%`, limit]);
        }
        catch (error) {
            this.logger.instance.error("Error searching profiles", error);
            throw error;
        }
    }
    async getRecommendedProfiles(userId, limit = 5) {
        try {
            const sql = `
                SELECT 
                    p.user_id,
                    p.username,
                    p.display_name,
                    p.avatar_url,
                    u.full_name,
                    u.headline,
                    (
                        COALESCE(skill_match.count, 0) * 5 +
                        COALESCE(exp_match.count, 0) * 10 +
                        COALESCE(edu_match.count, 0) * 15 +
                        COALESCE(proj_match.count, 0) * 5
                    ) as score
                FROM profiles p
                JOIN users u ON p.user_id = u.id
                -- Skill Match
                LEFT JOIN (
                    SELECT t.user_id, COUNT(*) as count
                    FROM profiles s, profiles t, unnest(s.skills) s_skill, unnest(t.skills) t_skill
                    WHERE s.user_id = $1 AND t.user_id != $1 AND s_skill = t_skill
                    GROUP BY t.user_id
                ) skill_match ON p.user_id = skill_match.user_id
                -- Experience Match (Même entreprise)
                LEFT JOIN (
                    SELECT t.profile_id, COUNT(DISTINCT t.company_name) as count
                    FROM experiences s
                    JOIN experiences t ON s.company_name = t.company_name
                    WHERE s.profile_id = $1 AND t.profile_id != $1
                    GROUP BY t.profile_id
                ) exp_match ON p.user_id = exp_match.profile_id
                -- Education Match (Même école)
                LEFT JOIN (
                    SELECT t.profile_id, COUNT(DISTINCT t.school_name) as count
                    FROM educations s
                    JOIN educations t ON s.school_name = t.school_name
                    WHERE s.profile_id = $1 AND t.profile_id != $1
                    GROUP BY t.profile_id
                ) edu_match ON p.user_id = edu_match.profile_id
                -- Project Tags Match (Intérêts communs)
                LEFT JOIN (
                    SELECT t.profile_id, COUNT(*) as count
                    FROM projects s, projects t, unnest(s.tags) s_tag, unnest(t.tags) t_tag
                    WHERE s.profile_id = $1 AND t.profile_id != $1 AND s_tag = t_tag
                    GROUP BY t.profile_id
                ) proj_match ON p.user_id = proj_match.profile_id
                WHERE p.user_id != $1
                AND NOT EXISTS (SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = p.user_id)
                AND (
                    COALESCE(skill_match.count, 0) > 0 OR 
                    COALESCE(exp_match.count, 0) > 0 OR 
                    COALESCE(edu_match.count, 0) > 0 OR
                    COALESCE(proj_match.count, 0) > 0
                )
                ORDER BY score DESC
                LIMIT $2
            `;
            return await this.db.query(sql, [userId, limit]);
        }
        catch (error) {
            this.logger.instance.error("Error fetching recommended profiles", error);
            return [];
        }
    }
}
exports.ProfilesRepository = ProfilesRepository;
//# sourceMappingURL=profiles.repository.js.map