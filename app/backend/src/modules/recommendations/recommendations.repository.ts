import PostgresDatabase from "../../config/databases/configDB";
import { CreateSignalDTO } from "./recommendations.types";
import Logger from "../../infra/logger/winston";

export class RecommendationsRepository {
    private db: PostgresDatabase;

    constructor() {
        this.db = new PostgresDatabase();
        this.initTable();
    }

    private async initTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS public.user_signals (
                signal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                item_id UUID NOT NULL,
                item_type VARCHAR(20) NOT NULL,
                action_type VARCHAR(50) NOT NULL,
                metadata JSONB DEFAULT '{}',
                weight FLOAT DEFAULT 1.0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        try {
            await this.db.query(createTableQuery);
        } catch (error) {
            console.error("[RecsRepo] Failed to init table:", error);
        }
    }

    /**
     * Advanced Profile Recommendation Algorithm
     * Combines multiple signals for intelligent suggestions
     */
    async getProfileRecommendations(userId: string, limit: number = 10): Promise<any[]> {
        const query = `
            WITH mutual_follows AS (
                -- People followed by people you follow (Friends of Friends)
                SELECT 
                    f2.following_id as suggested_profile_id,
                    COUNT(*) * 10 as score,
                    'mutual_connections' as reason
                FROM follows f1
                JOIN follows f2 ON f1.following_id = f2.follower_id
                WHERE f1.follower_id = $1 
                    AND f2.following_id != $1
                    AND f2.following_id NOT IN (
                        SELECT following_id FROM follows WHERE follower_id = $1
                    )
                GROUP BY f2.following_id
            ),
            common_interests AS (
                -- Same company, school, or skills
                SELECT 
                    p.user_id as suggested_profile_id,
                    (
                        CASE WHEN EXISTS(
                            SELECT 1 FROM experiences e1 
                            JOIN experiences e2 ON e1.company = e2.company
                            WHERE e1.profile_id = $1 AND e2.profile_id = p.user_id
                        ) THEN 7 ELSE 0 END
                        +
                        CASE WHEN EXISTS(
                            SELECT 1 FROM educations ed1
                            JOIN educations ed2 ON ed1.school_name = ed2.school_name
                            WHERE ed1.profile_id = $1 AND ed2.profile_id = p.user_id
                        ) THEN 7 ELSE 0 END
                        +
                        (SELECT COUNT(*) * 2 FROM profile_skills ps1
                         JOIN profile_skills ps2 ON ps1.skill_id = ps2.skill_id
                         WHERE ps1.profile_id = $1 AND ps2.profile_id = p.user_id)
                    ) as score,
                    'common_interests' as reason
                FROM profiles p
                WHERE p.user_id != $1
                    AND p.user_id NOT IN (SELECT following_id FROM follows WHERE follower_id = $1)
            ),
            similar_behavior AS (
                -- People who liked the same posts as you
                SELECT 
                    l2.profile_id as suggested_profile_id,
                    COUNT(*) * 5 as score,
                    'similar_behavior' as reason
                FROM likes l1
                JOIN likes l2 ON l1.post_id = l2.post_id
                WHERE l1.profile_id = $1
                    AND l2.profile_id != $1
                    AND l2.profile_id NOT IN (
                        SELECT following_id FROM follows WHERE follower_id = $1
                    )
                GROUP BY l2.profile_id
            ),
            geographic_proximity AS (
                -- Same location
                SELECT 
                    p.user_id as suggested_profile_id,
                    3 as score,
                    'same_location' as reason
                FROM profiles p
                JOIN profiles me ON me.user_id = $1
                WHERE p.location_name = me.location_name
                    AND p.location_name IS NOT NULL
                    AND p.user_id != $1
                    AND p.user_id NOT IN (SELECT following_id FROM follows WHERE follower_id = $1)
            ),
            all_suggestions AS (
                SELECT * FROM mutual_follows
                UNION ALL
                SELECT * FROM common_interests WHERE score > 0
                UNION ALL
                SELECT * FROM similar_behavior
                UNION ALL
                SELECT * FROM geographic_proximity
            ),
            aggregated AS (
                SELECT 
                    suggested_profile_id,
                    SUM(score) as total_score,
                    array_agg(DISTINCT reason) as reasons
                FROM all_suggestions
                GROUP BY suggested_profile_id
                ORDER BY total_score DESC
                LIMIT $2
            )
            SELECT 
                p.user_id as id,
                p.user_id,
                u.full_name,
                p.bio as headline,
                p.avatar_url,
                p.location_name as location,
                a.total_score,
                a.reasons
            FROM aggregated a
            JOIN profiles p ON p.user_id = a.suggested_profile_id
            JOIN users u ON u.id = p.user_id
            ORDER BY a.total_score DESC
        `;

        return this.db.query(query, [userId, limit]);
    }


    async saveSignal(signal: CreateSignalDTO): Promise<void> {
        const query = `
            INSERT INTO public.user_signals 
            (user_id, item_id, item_type, action_type, metadata, weight)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        let weight = signal.weight || 1.0;

        // Auto-weighting logic if not provided
        if (!signal.weight) {
            switch (signal.action_type) {
                case 'VIEW': weight = 0.1; break;
                case 'CLICK': weight = 1.0; break;
                case 'LIKE': weight = 2.0; break;
                case 'COMMENT': weight = 3.0; break;
                case 'SHARE': weight = 4.0; break;
                case 'APPLY': weight = 10.0; break;
                case 'CONNECT': weight = 5.0; break;
                case 'DISMISS': weight = -5.0; break; // Negative feedback
            }
        }

        await this.db.query(query, [
            signal.user_id,
            signal.item_id,
            signal.item_type,
            signal.action_type,
            signal.metadata || {},
            weight
        ]);
    }
}
