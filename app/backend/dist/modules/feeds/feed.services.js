"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedService = void 0;
const feed_signals_repository_1 = require("./feed.signals.repository");
const feed_scoring_service_1 = require("./feed.scoring.service");
const winston_1 = __importDefault(require("../../infra/logger/winston"));
class FeedService {
    constructor(feedRepo, recRepo, profilesRepo, signalsRepo = new feed_signals_repository_1.FeedSignalsRepository(), scoringService = new feed_scoring_service_1.FeedScoringService()) {
        this.feedRepo = feedRepo;
        this.recRepo = recRepo;
        this.profilesRepo = profilesRepo;
        this.signalsRepo = signalsRepo;
        this.scoringService = scoringService;
        this.logger = new winston_1.default();
        const raw = process.env.FEED_MAX_PER_AUTHOR;
        const parsed = raw ? parseInt(raw, 10) : NaN;
        const fallback = 10; // Augmenté de 2 à 10 pour éviter de masquer vos propres posts en dev
        this.MAX_PER_AUTHOR = !isNaN(parsed) && parsed > 0 ? parsed : fallback;
    }
    /**
     * Feed original (pagination par offset)
     */
    async getPowerFeed(userId, page = 1) {
        const limit = 15;
        const offset = (page - 1) * limit;
        try {
            this.logger.instance.info(`[FeedService] getPowerFeed called for user ${userId}, page=${page}`);
            const [content, profileRecs, jobRecs] = await Promise.all([
                this.feedRepo.getMainFeed(userId, limit + 1, offset),
                page === 1 ? this.profilesRepo.getRecommendedProfiles(userId, 5).catch(() => []) : Promise.resolve([]),
                page === 1 ? this.recRepo.getJobRecommendations(userId, 3).catch(() => []) : Promise.resolve([])
            ]);
            this.logger.instance.info(`[FeedService] Retrieved ${content?.length || 0} posts, ${profileRecs?.length || 0} profile recs, ${jobRecs?.length || 0} job recs`);
            const safeContent = Array.isArray(content) ? content : [];
            const hasMore = safeContent.length > limit;
            const slicedContent = hasMore ? safeContent.slice(0, limit) : safeContent;
            const diversifiedContent = this.diversifyFeed(slicedContent);
            const finalFeed = this.assembleFeed(diversifiedContent, profileRecs || [], jobRecs || [], page);
            this.logger.instance.info(`[FeedService] Final feed assembled with ${finalFeed?.length || 0} items`);
            return { items: finalFeed || [], hasMore };
        }
        catch (error) {
            this.logger.instance.error(`[FeedService] Error assembling feed for ${userId}:`, {
                error: error.message,
                stack: error.stack
            });
            try {
                const fallback = await this.feedRepo.getMainFeed(userId, limit + 1, offset);
                const safeFallback = Array.isArray(fallback) ? fallback : [];
                const hasMore = safeFallback.length > limit;
                const sliced = hasMore ? safeFallback.slice(0, limit) : safeFallback;
                this.logger.instance.info(`[FeedService] Fallback returned ${sliced.length} items`);
                return { items: sliced, hasMore };
            }
            catch (fallbackError) {
                this.logger.instance.error(`[FeedService] Fallback also failed:`, fallbackError);
                return { items: [], hasMore: false };
            }
        }
    }
    /**
     * Feed personnalisé avec cursor-based pagination
     * Utilise les signaux d'interaction pour scorer et personnaliser
     */
    async getPowerFeedWithCursor(userId, limit = 15, cursor) {
        try {
            // STRATÉGIE LINKEDIN :
            // Sur la première page (refresh), on récupère un "Pool" plus large (ex: 50 items)
            // pour permettre à l'algorithme de mieux trier et diversifier le contenu.
            const fetchLimit = !cursor ? 50 : limit + 2;
            // 1. Fetch raw content avec cursor
            const { items: rawContent, hasMore, nextCursor } = await this.feedRepo.getMainFeedWithCursor(userId, fetchLimit, cursor);
            if (!rawContent || rawContent.length === 0) {
                return { items: [], hasMore: false, nextCursor: null, cursor_info: null };
            }
            // 2. Récupérer le profil et les infos de l'utilisateur
            const [userProfile, interactionProfile] = await Promise.all([
                this.getUserProfile(userId),
                this.signalsRepo.getInteractionProfile(userId)
            ]);
            // 3. Score chaque item
            const scoredItems = await Promise.all(rawContent.map(async (item) => {
                const isFollowing = await this.signalsRepo.isUserFollowing(userId, item.author_id);
                const creator = {
                    reputation_score: item.author_reputation_score || 0,
                    is_verified: item.author_is_verified || false,
                    follower_count: item.author_follower_count || 0,
                    skills: item.author_skills || [],
                };
                const finalScore = this.scoringService.calculateFinalScore(item, creator, userProfile, isFollowing);
                // Ajout d'un "Jitter" (bruit aléatoire) pour que le feed change légèrement à chaque refresh
                // comme sur les grands réseaux sociaux.
                const randomBoost = Math.random() * 5;
                return {
                    ...item,
                    scoring: {
                        creativity: this.scoringService.calculateCreativityScore(item),
                        opportunity: this.scoringService.calculateOpportunityScore(item),
                        talent: this.scoringService.calculateTalentScore(item, {}),
                        personalRelevance: isFollowing ? 2.5 : 1.0,
                        finalScore: finalScore + randomBoost
                    }
                };
            }));
            // 4. Trier par score final
            const ranked = scoredItems.sort((a, b) => b.scoring.finalScore - a.scoring.finalScore);
            // 5. Diversifier (max 2 par auteur)
            const diversified = this.diversifyFeed(ranked.slice(0, limit));
            // 6. Assembler avec recommandations (seulement page 1)
            const final = !cursor
                ? (await this.assembleFeedWithRecommendations(diversified, userId))
                : diversified;
            return {
                items: final,
                hasMore,
                nextCursor,
                cursor_info: {
                    method: 'cursor-based',
                    personalization: interactionProfile,
                }
            };
        }
        catch (error) {
            this.logger.instance.error(`[FeedService] Error in cursor feed for ${userId}: ${error}`);
            // Fallback à l'ancien système
            return this.getPowerFeed(userId, 1);
        }
    }
    /**
     * Détermine si l'utilisateur est en "cold start" (aucune interaction enregistrée).
     * Utilisé pour proposer un feed initial basé sur le secteur.
     */
    async isColdStartUser(userId) {
        try {
            const interactionProfile = await this.signalsRepo.getInteractionProfile(userId);
            // Aucun signal → cold start
            return !interactionProfile || interactionProfile.totalInteractions === 0;
        }
        catch (error) {
            this.logger.instance.error(`[FeedService] Error checking cold-start status for ${userId}: ${error}`);
            return false;
        }
    }
    /**
     * Feed de démarrage basé sur le secteur d'activité (industry_id) de l'utilisateur.
     * Utilisé uniquement pour les nouveaux comptes n'ayant pas encore d'interactions.
     */
    async getColdStartFeed(userId) {
        const limit = 15;
        try {
            const baseContent = await this.feedRepo.getColdStartFeedByIndustry(userId, limit + 1);
            const hasMore = baseContent.length > limit;
            const slicedContent = hasMore ? baseContent.slice(0, limit) : baseContent;
            const diversifiedContent = this.diversifyFeed(slicedContent);
            // On peut réutiliser les mêmes recommandations profils/jobs que le feed classique
            const [profileRecs, jobRecs] = await Promise.all([
                this.profilesRepo.getRecommendedProfiles(userId, 5),
                this.recRepo.getJobRecommendations(userId, 3)
            ]);
            const finalFeed = this.assembleFeed(diversifiedContent, profileRecs, jobRecs, 1);
            return { items: finalFeed, hasMore };
        }
        catch (error) {
            this.logger.instance.error(`[FeedService] Error assembling cold-start feed for ${userId}: ${error}`);
            // Fallback sur le power feed normal si quelque chose se passe mal
            return this.getPowerFeed(userId, 1);
        }
    }
    /**
     * Récupère le profil utilisateur pour la personnalisation
     */
    async getUserProfile(userId) {
        try {
            // Récupérer le profil utilisateur réel depuis le ProfilesRepository
            const userProfile = await this.profilesRepo.getProfileByUserId(userId);
            if (userProfile) {
                return {
                    id: userProfile.user_id || userId,
                    skills: userProfile.skills || [],
                    location: { city: userProfile.location_name }, // Simplifié
                    company_id: null, // Ajouter si disponible dans le profil
                };
            }
            return { id: userId, skills: [], location: null, company_id: null };
        }
        catch (error) {
            return { id: userId, skills: [], location: null, company_id: null };
        }
    }
    /**
     * Assemble le feed avec recommandations (page 1 uniquement)
     */
    async assembleFeedWithRecommendations(content, userId) {
        try {
            const [profileRecs, jobRecs] = await Promise.all([
                this.profilesRepo.getRecommendedProfiles(userId, 5),
                this.recRepo.getJobRecommendations(userId, 3)
            ]);
            let finalFeed = [...content];
            // Injecter recommandations de profils à l'index 2
            if (profileRecs.length > 0) {
                finalFeed.splice(2, 0, {
                    item_id: `rec_profiles_${Date.now()}`,
                    content_type: 'RECOMMENDATION_PROFILES',
                    data: profileRecs,
                    is_advertisement: false
                });
            }
            // Injecter recommandations de jobs à l'index 6
            if (jobRecs.length > 0) {
                finalFeed.splice(6, 0, {
                    item_id: `rec_jobs_${Date.now()}`,
                    content_type: 'RECOMMENDATION_JOBS',
                    data: jobRecs,
                    is_advertisement: false
                });
            }
            return finalFeed;
        }
        catch (error) {
            this.logger.instance.error(`[FeedService] Error assembling with recommendations: ${error}`);
            return content;
        }
    }
    getAuthorKey(post) {
        return post.author_id ?? post.profile_id ?? post.company_id ?? null;
    }
    diversifyFeed(posts) {
        if (posts.length <= 1)
            return posts;
        const counts = {};
        const seenIds = new Set();
        const filtered = posts.filter((post) => {
            const itemId = post.id ?? post.item_id;
            if (itemId) {
                if (seenIds.has(itemId))
                    return false;
                seenIds.add(itemId);
            }
            const authorId = this.getAuthorKey(post);
            if (!authorId)
                return true;
            const current = counts[authorId] ?? 0;
            if (current >= this.MAX_PER_AUTHOR)
                return false;
            counts[authorId] = current + 1;
            return true;
        });
        if (filtered.length <= 1)
            return filtered;
        const result = [];
        const pool = [...filtered];
        while (pool.length > 0) {
            // Anti-clustering: on essaie de ne pas avoir le même auteur sur les 2 derniers slots
            const prev1 = result.length > 0 ? this.getAuthorKey(result[result.length - 1]) : null;
            const prev2 = result.length > 1 ? this.getAuthorKey(result[result.length - 2]) : null;
            let nextIndex = pool.findIndex(p => {
                const author = this.getAuthorKey(p);
                return author !== prev1 && author !== prev2;
            });
            // Si on ne trouve pas de post décalé de 2 places, on se contente d'un décalage d'1 place
            if (nextIndex === -1) {
                nextIndex = pool.findIndex(p => this.getAuthorKey(p) !== prev1);
            }
            if (nextIndex === -1) {
                result.push(...pool);
                break;
            }
            const post = pool.splice(nextIndex, 1)[0];
            result.push(post);
        }
        return result;
    }
    /**
     * Injection des blocs de recommandations (Visibilité & Opportunités)
     */
    assembleFeed(content, profileRecs, jobRecs, page) {
        let finalFeed = [...content];
        if (page === 1) {
            // Bloc Visibilité : Profils suggérés à l'index 2
            if (profileRecs.length > 0) {
                finalFeed.splice(2, 0, {
                    item_id: `rec_profiles_${Date.now()}`,
                    content_type: 'RECOMMENDATION_PROFILES',
                    data: profileRecs,
                    is_advertisement: false
                });
            }
            // Bloc Opportunités : Jobs suggérés à l'index 6
            if (jobRecs.length > 0) {
                finalFeed.splice(6, 0, {
                    item_id: `rec_jobs_${Date.now()}`,
                    content_type: 'RECOMMENDATION_JOBS',
                    data: jobRecs,
                    is_advertisement: false
                });
            }
        }
        return finalFeed;
    }
}
exports.FeedService = FeedService;
//# sourceMappingURL=feed.services.js.map