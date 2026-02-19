import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";

export class FeedSignalsRepository {
    private logger = new Logger();

    constructor(private readonly db = new PostgresDatabase()) {}

    /**
     * Récupère les signaux récents de l'utilisateur (interactions)
     */
    async getRecentSignals(userId: string, days: number = 30, limit: number = 1000) {
        try {
            const query = `
                SELECT 
                    signal_id,
                    user_id,
                    item_id,
                    item_type,
                    action_type,
                    weight,
                    metadata,
                    created_at
                FROM user_signals
                WHERE user_id = $1
                AND created_at > NOW() - INTERVAL '${days} days'
                ORDER BY created_at DESC
                LIMIT $2
            `;

            return await this.db.query(query, [userId, limit]);
        } catch (error) {
            this.logger.instance.error(`[FeedSignalsRepository] Error fetching signals for ${userId}: ${error}`);
            return [];
        }
    }

    /**
     * Vérifie si l'utilisateur suit un autre utilisateur
     */
    async isUserFollowing(followerId: string, followingId: string): Promise<boolean> {
        try {
            const query = `
                SELECT 1 FROM follows
                WHERE follower_id = $1 AND following_id = $2
                LIMIT 1
            `;
            const result = await this.db.query(query, [followerId, followingId]);
            return result.length > 0;
        } catch (error) {
            this.logger.instance.error(`[FeedSignalsRepository] Error checking follow status: ${error}`);
            return false;
        }
    }

    /**
     * Récupère le profil d'intérêt agrégé de l'utilisateur
     */
    async getInteractionProfile(userId: string) {
        try {
            const signals = await this.getRecentSignals(userId, 30);

            // Agrège par type d'interaction
            const profile = {
                topSkills: new Map<string, number>(),
                topCompanies: new Map<string, number>(),
                topCreators: new Map<string, number>(),
                topHashtags: new Map<string, number>(),
                totalInteractions: signals.length,
            };

            signals.forEach((signal: any) => {
                if (signal.action_type === 'DISMISS') return; // Skip dismissed

                const weight = signal.weight || 1;

                // Extract metadata
                if (signal.metadata?.skills) {
                    signal.metadata.skills.forEach((skill: string) => {
                        profile.topSkills.set(skill, (profile.topSkills.get(skill) || 0) + weight);
                    });
                }

                if (signal.metadata?.company_id) {
                    profile.topCompanies.set(
                        signal.metadata.company_id,
                        (profile.topCompanies.get(signal.metadata.company_id) || 0) + weight
                    );
                }

                if (signal.metadata?.author_id) {
                    profile.topCreators.set(
                        signal.metadata.author_id,
                        (profile.topCreators.get(signal.metadata.author_id) || 0) + weight
                    );
                }

                if (signal.metadata?.hashtags) {
                    signal.metadata.hashtags.forEach((tag: string) => {
                        profile.topHashtags.set(tag, (profile.topHashtags.get(tag) || 0) + weight);
                    });
                }
            });

            // Convert maps to sorted arrays
            return {
                topSkills: Array.from(profile.topSkills.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([skill]) => skill),
                topCompanies: Array.from(profile.topCompanies.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([company]) => company),
                topCreators: Array.from(profile.topCreators.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([creator]) => creator),
                topHashtags: Array.from(profile.topHashtags.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([tag]) => tag),
                totalInteractions: profile.totalInteractions,
            };
        } catch (error) {
            this.logger.instance.error(`[FeedSignalsRepository] Error building interaction profile: ${error}`);
            return {
                topSkills: [],
                topCompanies: [],
                topCreators: [],
                topHashtags: [],
                totalInteractions: 0,
            };
        }
    }

    /**
     * Enregistre une interaction utilisateur
     */
    async recordInteraction(
        userId: string,
        itemId: string,
        interactionType: string,
        timeSpentMs: number = 0,
        metadata: any = {}
    ) {
        try {
            const query = `
                INSERT INTO feed_interactions (user_id, item_id, interaction_type, time_spent_ms, metadata)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT DO NOTHING
            `;

            await this.db.query(query, [userId, itemId, interactionType, timeSpentMs, JSON.stringify(metadata)]);
        } catch (error) {
            this.logger.instance.error(`[FeedSignalsRepository] Error recording interaction: ${error}`);
        }
    }
}
