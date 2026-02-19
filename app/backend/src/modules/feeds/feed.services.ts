import { FeedRepository } from "./feed.repository";
import { RecommendationsRepository } from "../recommendations/recommendations.repository";
import { FeedSignalsRepository } from "./feed.signals.repository";
import { FeedScoringService } from "./feed.scoring.service";
import Logger from "../../infra/logger/winston";
import { ProfilesRepository } from "../profiles/profiles.repository";

export class FeedService {
    private readonly logger = new Logger();
    private readonly MAX_PER_AUTHOR: number;

    constructor(
        private feedRepo: FeedRepository,
        private recRepo: RecommendationsRepository,
        private profilesRepo: ProfilesRepository,
        private signalsRepo = new FeedSignalsRepository(),
        private scoringService = new FeedScoringService()
    ) {
        const raw = process.env.FEED_MAX_PER_AUTHOR;
        const parsed = raw ? parseInt(raw, 10) : NaN;
        const fallback = 10; // Augmenté de 2 à 10 pour éviter de masquer vos propres posts en dev
        this.MAX_PER_AUTHOR = !isNaN(parsed) && parsed > 0 ? parsed : fallback;
    }

    /**
     * Feed original (pagination par offset)
     */
    async getPowerFeed(userId: string, page: number = 1) {
        const limit = 15;
        const offset = (page - 1) * limit;

        try {
            const [content, profileRecs, jobRecs] = await Promise.all([
                this.feedRepo.getMainFeed(userId, limit + 1, offset),
                page === 1 ? this.profilesRepo.getRecommendedProfiles(userId, 5) : Promise.resolve([]),
                page === 1 ? this.recRepo.getJobRecommendations(userId, 3) : Promise.resolve([])
            ]);

            const hasMore = content.length > limit;
            const slicedContent = hasMore ? content.slice(0, limit) : content;

            const diversifiedContent = this.diversifyFeed(slicedContent);
            const finalFeed = this.assembleFeed(diversifiedContent, profileRecs, jobRecs, page);

            return { items: finalFeed, hasMore };
        } catch (error) {
            this.logger.instance.error(`[FeedService] Error assembling feed for ${userId}: ${error}`);
            const fallback = await this.feedRepo.getMainFeed(userId, limit + 1, offset);
            const hasMore = fallback.length > limit;
            const sliced = hasMore ? fallback.slice(0, limit) : fallback;
            return { items: sliced, hasMore };
        }
    }

    /**
     * Feed personnalisé avec cursor-based pagination
     * Utilise les signaux d'interaction pour scorer et personnaliser
     */
    async getPowerFeedWithCursor(
        userId: string,
        limit: number = 15,
        cursor?: { timestamp: string; itemId: string }
    ) {
        try {
            // STRATÉGIE LINKEDIN :
            // Sur la première page (refresh), on récupère un "Pool" plus large (ex: 50 items)
            // pour permettre à l'algorithme de mieux trier et diversifier le contenu.
            const fetchLimit = !cursor ? 50 : limit + 2;

            // 1. Fetch raw content avec cursor
            const { items: rawContent, hasMore, nextCursor } = 
                await this.feedRepo.getMainFeedWithCursor(userId, fetchLimit, cursor);

            if (!rawContent || rawContent.length === 0) {
                return { items: [], hasMore: false, nextCursor: null, cursor_info: null };
            }

            // 2. Récupérer le profil et les infos de l'utilisateur
            const [userProfile, interactionProfile] = await Promise.all([
                this.getUserProfile(userId),
                this.signalsRepo.getInteractionProfile(userId)
            ]);

            // 3. Score chaque item
            const scoredItems = await Promise.all(
                rawContent.map(async (item: any) => {
                    const isFollowing = await this.signalsRepo.isUserFollowing(
                        userId,
                        item.author_id
                    );

                    const finalScore = this.scoringService.calculateFinalScore(
                        item,
                        { 
                            reputation_score: 0, 
                            is_verified: false, 
                            follower_count: 0 
                        },
                        userProfile,
                        isFollowing
                    );

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
                })
            );

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
        } catch (error) {
            this.logger.instance.error(`[FeedService] Error in cursor feed for ${userId}: ${error}`);
            // Fallback à l'ancien système
            return this.getPowerFeed(userId, 1);
        }
    }

    /**
     * Détermine si l'utilisateur est en "cold start" (aucune interaction enregistrée).
     * Utilisé pour proposer un feed initial basé sur le secteur.
     */
    async isColdStartUser(userId: string): Promise<boolean> {
        try {
            const interactionProfile = await this.signalsRepo.getInteractionProfile(userId);
            // Aucun signal → cold start
            return !interactionProfile || interactionProfile.totalInteractions === 0;
        } catch (error) {
            this.logger.instance.error(`[FeedService] Error checking cold-start status for ${userId}: ${error}`);
            return false;
        }
    }

    /**
     * Feed de démarrage basé sur le secteur d'activité (industry_id) de l'utilisateur.
     * Utilisé uniquement pour les nouveaux comptes n'ayant pas encore d'interactions.
     */
    async getColdStartFeed(userId: string) {
        const limit = 15;

        try {
            const baseContent: any[] = await this.feedRepo.getColdStartFeedByIndustry(userId, limit + 1);
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
        } catch (error) {
            this.logger.instance.error(`[FeedService] Error assembling cold-start feed for ${userId}: ${error}`);
            // Fallback sur le power feed normal si quelque chose se passe mal
            return this.getPowerFeed(userId, 1);
        }
    }

    /**
     * Récupère le profil utilisateur pour la personnalisation
     */
    private async getUserProfile(userId: string): Promise<any> {
        try {
            // Récupérer le profil utilisateur réel depuis le ProfilesRepository
            const userProfile = await this.profilesRepo.getProfileByUserId(userId);
            if (userProfile) {
                return {
                    id: userProfile.user_id,
                    skills: userProfile.skills || [],
                    location: { city: userProfile.location_name }, // Simplifié
                    company_id: null, // Ajouter si disponible dans le profil
                };
            }
            return { id: userId, skills: [], location: null, company_id: null };
        } catch (error) {
            return { id: userId, skills: [], location: null, company_id: null };
        }
    }

    /**
     * Assemble le feed avec recommandations (page 1 uniquement)
     */
    private async assembleFeedWithRecommendations(
        content: any[],
        userId: string
    ): Promise<any[]> {
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
        } catch (error) {
            this.logger.instance.error(`[FeedService] Error assembling with recommendations: ${error}`);
            return content;
        }
    }

    private getAuthorKey(post: any): string | null {
        return post.author_id ?? post.profile_id ?? post.company_id ?? null;
    }

    private diversifyFeed(posts: any[]): any[] {
        if (posts.length <= 1) return posts;

        const counts: Record<string, number> = {};
        const seenIds = new Set<string>();

        const filtered = posts.filter((post: any) => {
            const itemId: string | undefined = post.id ?? post.item_id;
            if (itemId) {
                if (seenIds.has(itemId)) return false;
                seenIds.add(itemId);
            }

            const authorId = this.getAuthorKey(post);
            if (!authorId) return true;

            const current = counts[authorId] ?? 0;
            if (current >= this.MAX_PER_AUTHOR) return false;

            counts[authorId] = current + 1;
            return true;
        });

        if (filtered.length <= 1) return filtered;

        const result: any[] = [];
        const pool = [...filtered];
        let lastAuthorId: string | null = null;

        while (pool.length > 0) {
            const nextIndex = pool.findIndex(p => this.getAuthorKey(p) !== lastAuthorId);

            if (nextIndex === -1) {
                result.push(...pool);
                break;
            }

            const post = pool.splice(nextIndex, 1)[0];
            result.push(post);
            lastAuthorId = this.getAuthorKey(post);
        }

        return result;
    }

    /**
     * Injection des blocs de recommandations (Visibilité & Opportunités)
     */
    private assembleFeed(content: any[], profileRecs: any[], jobRecs: any[], page: number) {
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
