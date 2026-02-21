"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedSignalsRepository = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
class FeedSignalsRepository {
    constructor(db = new configDB_1.default()) {
        this.db = db;
        this.logger = new winston_1.default();
    }
    /**
     * Récupère les signaux récents de l'utilisateur (interactions)
     */
    async getRecentSignals(userId, days = 30, limit = 1000) {
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
        }
        catch (error) {
            this.logger.instance.error(`[FeedSignalsRepository] Error fetching signals for ${userId}: ${error}`);
            return [];
        }
    }
    /**
     * Vérifie si l'utilisateur suit un autre utilisateur
     */
    async isUserFollowing(followerId, followingId) {
        try {
            const query = `
                SELECT 1 FROM follows
                WHERE follower_id = $1 AND following_id = $2
                LIMIT 1
            `;
            const result = await this.db.query(query, [followerId, followingId]);
            return result.length > 0;
        }
        catch (error) {
            this.logger.instance.error(`[FeedSignalsRepository] Error checking follow status: ${error}`);
            return false;
        }
    }
    /**
     * Récupère le profil d'intérêt agrégé de l'utilisateur
     */
    async getInteractionProfile(userId) {
        try {
            const signals = await this.getRecentSignals(userId, 30);
            // Agrège par type d'interaction
            const profile = {
                topSkills: new Map(),
                topCompanies: new Map(),
                topCreators: new Map(),
                topHashtags: new Map(),
                totalInteractions: signals.length,
            };
            signals.forEach((signal) => {
                if (signal.action_type === 'DISMISS')
                    return; // Skip dismissed
                const weight = signal.weight || 1;
                // Extract metadata
                if (signal.metadata?.skills) {
                    signal.metadata.skills.forEach((skill) => {
                        profile.topSkills.set(skill, (profile.topSkills.get(skill) || 0) + weight);
                    });
                }
                if (signal.metadata?.company_id) {
                    profile.topCompanies.set(signal.metadata.company_id, (profile.topCompanies.get(signal.metadata.company_id) || 0) + weight);
                }
                if (signal.metadata?.author_id) {
                    profile.topCreators.set(signal.metadata.author_id, (profile.topCreators.get(signal.metadata.author_id) || 0) + weight);
                }
                if (signal.metadata?.hashtags) {
                    signal.metadata.hashtags.forEach((tag) => {
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
        }
        catch (error) {
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
    async recordInteraction(userId, itemId, interactionType, timeSpentMs = 0, metadata = {}) {
        try {
            const query = `
                INSERT INTO feed_interactions (user_id, item_id, interaction_type, time_spent_ms, metadata)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT DO NOTHING
            `;
            await this.db.query(query, [userId, itemId, interactionType, timeSpentMs, JSON.stringify(metadata)]);
        }
        catch (error) {
            this.logger.instance.error(`[FeedSignalsRepository] Error recording interaction: ${error}`);
        }
    }
}
exports.FeedSignalsRepository = FeedSignalsRepository;
//# sourceMappingURL=feed.signals.repository.js.map