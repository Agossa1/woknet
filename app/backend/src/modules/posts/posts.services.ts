import { RedisClientType } from "redis";
import Logger from "../../infra/logger/winston";
import { IPostsRepository } from "./posts.repository";
import { Post, CreatePostDTO, UpdatePostDTO, PostType } from "./posts.types";
import { CloudinaryService } from "../../infra/storage/cloudinary.service";
import { socketService } from "../../infra/realtime/socket.service";
import { HashtagsService } from "../hashtags/hashtags.service";

export class PostsServices {
    private readonly FEED_CACHE_KEY = "posts:feed:latest";
    private readonly POST_CACHE_PREFIX = "post:";

    private readonly hashtagsService: HashtagsService;

    constructor(
        private readonly repository: IPostsRepository,
        private readonly redis: RedisClientType,
        private readonly cloudinary: CloudinaryService,
        private readonly logger: Logger
    ) {
        this.hashtagsService = new HashtagsService();
    }

    async createPost(dto: CreatePostDTO, file?: Buffer, fileMimeType?: string): Promise<Post> {
        if (file) {
            this.logger.instance.info(`[PostsServices] Uploading file for new post...`);
            const url = await this.cloudinary.uploadFile(file, 'worknet/posts');
            dto.media_url = url;

            // Basic type detection from mime type
            if (fileMimeType?.startsWith('video/')) {
                dto.type = PostType.VIDEO;
            } else if (fileMimeType?.startsWith('image/')) {
                dto.type = PostType.IMAGE;
            }
        }

        const post = await this.repository.create(dto);

        // Process Hashtags
        if (post && post.content) {
            this.hashtagsService.processPostHashtags(post.id, post.content)
                .catch(err => this.logger.instance.error(`[Hashtags] Failed to process hashtags for post ${post.id}: ${err}`));
        }

        // Invalidate feed cache on new post
        if (post.visibility === 'PUBLIC') {
            await this.redis.del(this.FEED_CACHE_KEY);
            socketService.emit('new_post', post, 'feed');
        }

        return post;
    }

    async getPostById(id: string): Promise<Post | null> {
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

    async getProfilePosts(profileId: string, currentProfileId?: string): Promise<Post[]> {
        return this.repository.findAllByProfileId(profileId, currentProfileId);
    }

    async getCompanyPosts(companyId: string, currentProfileId?: string): Promise<Post[]> {
        return this.repository.findAllByCompanyId(companyId, currentProfileId);
    }

    async getFeed(page: number = 1, limit: number = 20, currentProfileId?: string): Promise<Post[]> {
        const offset = (page - 1) * limit;
        const userCacheKey = currentProfileId ? `${this.FEED_CACHE_KEY}:${currentProfileId}` : this.FEED_CACHE_KEY;

        // Cache only the first page
        if (page === 1 && limit === 20) {
            const cachedFeed = await this.redis.get(userCacheKey);
            if (cachedFeed) {
                return JSON.parse(cachedFeed);
            }
        }

        const posts = await this.repository.findFeed(limit, offset, currentProfileId);

        if (page === 1 && limit === 20) {
            // Cache for 2 minutes for authenticated users, 10 minutes for guest
            const ttl = currentProfileId ? 120 : 600;
            await this.redis.set(userCacheKey, JSON.stringify(posts), { EX: ttl });
        }

        return posts;
    }

    async updatePost(id: string, dto: UpdatePostDTO): Promise<Post> {
        const post = await this.repository.update(id, dto);

        // Sync Cache
        await this.redis.set(`${this.POST_CACHE_PREFIX}${id}`, JSON.stringify(post), { EX: 3600 });
        await this.redis.del(this.FEED_CACHE_KEY);

        return post;
    }

    async deletePost(id: string): Promise<boolean> {
        const deleted = await this.repository.delete(id);
        if (deleted) {
            await this.redis.del(`${this.POST_CACHE_PREFIX}${id}`);
            await this.redis.del(this.FEED_CACHE_KEY);
        }
        return deleted;
    }

    // Logic for Likes/Comments with Redis integration could be more complex (Atomic inc/dec)
    // but here we just proxies and clears cache
    async likePost(postId: string): Promise<void> {
        await this.repository.incrementLikes(postId);
        await this.redis.del(`${this.POST_CACHE_PREFIX}${postId}`);
    }

    async unlikePost(postId: string): Promise<void> {
        await this.repository.decrementLikes(postId);
        await this.redis.del(`${this.POST_CACHE_PREFIX}${postId}`);
    }
}
