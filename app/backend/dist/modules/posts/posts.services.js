"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsServices = void 0;
const posts_types_1 = require("./posts.types");
const socket_service_1 = require("../../infra/realtime/socket.service");
const hashtags_service_1 = require("../hashtags/hashtags.service");
class PostsServices {
    constructor(repository, feedRepository, redis, cloudinary, logger, feedService) {
        this.repository = repository;
        this.feedRepository = feedRepository;
        this.redis = redis;
        this.cloudinary = cloudinary;
        this.logger = logger;
        this.feedService = feedService;
        this.POST_CACHE_PREFIX = "post:";
        this.hashtagsService = new hashtags_service_1.HashtagsService();
        // Integration mentions
        const { MentionsModule } = require("../mentions/mentions.module");
        this.mentionsService = MentionsModule.getService();
    }
    async createPost(dto, file, fileMimeType) {
        if (file) {
            this.logger.instance.info(`[PostsServices] Uploading file for new post...`);
            const url = await this.cloudinary.uploadFile(file, 'worknet/posts');
            dto.media_url = url;
            // Basic type detection from mime type
            if (fileMimeType?.startsWith('video/')) {
                dto.type = posts_types_1.PostType.VIDEO;
            }
            else if (fileMimeType?.startsWith('image/')) {
                dto.type = posts_types_1.PostType.IMAGE;
            }
        }
        const post = await this.repository.create(dto);
        // Process Hashtags
        if (post && post.content) {
            this.hashtagsService.processPostHashtags(post.id, post.content)
                .catch(err => this.logger.instance.error(`[Hashtags] Failed to process hashtags for post ${post.id}: ${err}`));
            // Process Mentions
            this.mentionsService.processMentions(post.content, post.profile_id, 'post', post.id)
                .catch((err) => this.logger.instance.error(`[Mentions] Failed to process mentions for post ${post.id}: ${err}`));
        }
        // Invalidation intelligente : On force le rafraîchissement du feed de l'auteur
        await this.feedRepository.invalidateUserFeed(post.profile_id);
        // NOTE: On n'invalide PAS le cache des followers ici pour éviter le "Fan-out" (surcharge Redis).
        // Stratégie :
        // 1. WebSockets (ci-dessous) pour l'affichage temps réel immédiat.
        // 2. TTL du cache (5 min) pour la cohérence des données au prochain rechargement.
        // Invalidate feed cache on new post
        if (post.visibility === 'PUBLIC') {
            // Invalidation du cache invité (Page 1 par défaut) pour que le post apparaisse vite
            await this.redis.del('feed:guest:p1:l20');
            // Diffusion sur la room globale "feed" à laquelle tous les clients sont abonnés
            // (voir SocketService.init où chaque socket rejoint la room 'feed').
            socket_service_1.socketService.emit('new_post', post, 'feed');
        }
        return post;
    }
    async getPostById(id) {
        const cacheKey = `${this.POST_CACHE_PREFIX}${id}`;
        // Try Cache
        const cachedPost = await this.redis.get(cacheKey);
        if (cachedPost) {
            return JSON.parse(cachedPost);
        }
        const post = await this.repository.findById(id);
        if (post) {
            // Cache for 1 hour
            await this.redis.set(cacheKey, JSON.stringify(post), { EX: 3600 });
        }
        return post;
    }
    async getProfilePosts(profileId, currentProfileId) {
        return this.repository.findAllByProfileId(profileId, currentProfileId);
    }
    async getCompanyPosts(companyId, currentProfileId) {
        return this.repository.findAllByCompanyId(companyId, currentProfileId);
    }
    async getFeed(page = 1, limit = 20, currentProfileId) {
        const offset = (page - 1) * limit;
        let posts = [];
        // 1. Optimisation Cache Invités (Guest)
        if (!currentProfileId) {
            const guestCacheKey = `feed:guest:p${page}:l${limit}`;
            const cached = await this.redis.get(guestCacheKey);
            if (cached)
                return JSON.parse(cached);
            posts = await this.repository.findFeed(limit, offset, currentProfileId);
            // Cache 60s pour les invités (protection DB + fraîcheur raisonnable)
            await this.redis.set(guestCacheKey, JSON.stringify(posts), { EX: 60 });
            return posts;
        }
        // 2. Logique Utilisateurs Connectés (Power Feed)
        try {
            // Utilise le FeedService qui contient la logique de Jitter, Pool élargi et Recommandations
            const result = await this.feedService.getPowerFeed(currentProfileId, page);
            posts = result.items;
        }
        catch (error) {
            this.logger.instance.error(`[PostsServices] Error fetching PowerFeed: ${error}`);
            // Fallback en cas d'erreur
            posts = await this.repository.findFeed(limit, offset, currentProfileId);
        }
        return posts;
    }
    async updatePost(id, dto) {
        const post = await this.repository.update(id, dto);
        // Sync Cache
        await this.redis.set(`${this.POST_CACHE_PREFIX}${id}`, JSON.stringify(post), { EX: 3600 });
        return post;
    }
    async deletePost(id) {
        const deleted = await this.repository.delete(id);
        if (deleted) {
            await this.redis.del(`${this.POST_CACHE_PREFIX}${id}`);
        }
        return deleted;
    }
    // Logic for Likes/Comments with Redis integration could be more complex (Atomic inc/dec)
    // but here we just proxies and clears cache
    async likePost(postId) {
        await this.repository.incrementLikes(postId);
        await this.redis.del(`${this.POST_CACHE_PREFIX}${postId}`);
    }
    async unlikePost(postId) {
        await this.repository.decrementLikes(postId);
        await this.redis.del(`${this.POST_CACHE_PREFIX}${postId}`);
    }
    /**
     * Préchauffe le cache pour le feed invité (Page 1)
     * Appelé au démarrage du serveur pour éviter la latence du premier appel.
     */
    async warmupGuestFeed() {
        try {
            this.logger.instance.info("[Cache Warmup] Starting guest feed warmup...");
            const limit = 20;
            const offset = 0;
            const guestCacheKey = `feed:guest:p1:l${limit}`;
            const posts = await this.repository.findFeed(limit, offset, undefined);
            await this.redis.set(guestCacheKey, JSON.stringify(posts), { EX: 60 });
            this.logger.instance.info(`[Cache Warmup] Guest feed warmed up (${posts.length} items)`);
        }
        catch (error) {
            this.logger.instance.error(`[Cache Warmup] Failed: ${error}`);
        }
    }
}
exports.PostsServices = PostsServices;
//# sourceMappingURL=posts.services.js.map