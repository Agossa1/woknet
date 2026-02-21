"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsServices = void 0;
const socket_service_1 = require("../../infra/realtime/socket.service");
const notifications_types_1 = require("../notifications/notifications.types");
class CommentsServices {
    constructor(repository, postsRepository, notificationsService, redis, logger) {
        this.repository = repository;
        this.postsRepository = postsRepository;
        this.notificationsService = notificationsService;
        this.redis = redis;
        this.logger = logger;
        this.COMMENTS_CACHE_PREFIX = "comments:post:";
        const { MentionsModule } = require("../mentions/mentions.module");
        this.mentionsService = MentionsModule.getService();
    }
    async createComment(dto) {
        const comment = await this.repository.create(dto);
        // Process Mentions
        this.mentionsService.processMentions(comment.content, comment.profile_id, 'comment', comment.id)
            .catch((err) => this.logger.instance.error(`[Mentions] Failed to process mentions for comment ${comment.id}: ${err}`));
        // Increment post comments count
        await this.postsRepository.incrementComments(dto.post_id);
        // Invalidate cache
        await this.redis.del(`${this.COMMENTS_CACHE_PREFIX}${dto.post_id}`);
        if (dto.parent_id) {
            await this.repository.incrementComments(dto.parent_id);
            await this.redis.del(`comments:replies:${dto.parent_id}`);
        }
        // Real-time update
        socket_service_1.socketService.emit('new_comment', comment, 'feed');
        // TRIGGER NOTIFICATIONS
        if (this.notificationsService) {
            // Notification for Post Author
            const post = await this.postsRepository.findById(dto.post_id);
            if (post) {
                const notification = await this.notificationsService.createNotification({
                    recipient_id: post.profile_id,
                    sender_id: dto.profile_id,
                    type: notifications_types_1.NotificationType.POST_COMMENT,
                    item_id: dto.post_id,
                    content: comment.content // snippet of the comment
                });
                if (notification) {
                    socket_service_1.socketService.emitToUser(post.profile_id, 'new_notification', notification);
                }
            }
            // Notification for Original Comment Author (if Reply)
            if (dto.parent_id) {
                const parentComment = await this.repository.findById(dto.parent_id);
                if (parentComment && parentComment.profile_id !== post?.profile_id) {
                    const notification = await this.notificationsService.createNotification({
                        recipient_id: parentComment.profile_id,
                        sender_id: dto.profile_id,
                        type: notifications_types_1.NotificationType.POST_COMMENT, // Or define a specific COMMENT_REPLY type
                        item_id: dto.post_id,
                        content: comment.content
                    });
                    if (notification) {
                        socket_service_1.socketService.emitToUser(parentComment.profile_id, 'new_notification', notification);
                    }
                }
            }
        }
        return comment;
    }
    async getPostComments(postId, currentProfileId) {
        const cacheKey = `${this.COMMENTS_CACHE_PREFIX}${postId}`;
        // personalized results shouldn't be cached globally
        if (!currentProfileId) {
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }
        const comments = await this.repository.findByPostId(postId, currentProfileId);
        if (!currentProfileId) {
            // Cache for 5 minutes
            await this.redis.set(cacheKey, JSON.stringify(comments), { EX: 300 });
        }
        return comments;
    }
    async getReplies(parentId, currentProfileId) {
        const cacheKey = `comments:replies:${parentId}`;
        if (!currentProfileId) {
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }
        const replies = await this.repository.findReplies(parentId, currentProfileId);
        if (!currentProfileId) {
            await this.redis.set(cacheKey, JSON.stringify(replies), { EX: 300 });
        }
        return replies;
    }
    async updateComment(id, dto) {
        const comment = await this.repository.update(id, dto);
        // Invalidate caches
        await this.redis.del(`${this.COMMENTS_CACHE_PREFIX}${comment.post_id}`);
        if (comment.parent_id) {
            await this.redis.del(`comments:replies:${comment.parent_id}`);
        }
        socket_service_1.socketService.emit('comment_updated', comment, 'feed');
        return comment;
    }
    async deleteComment(id) {
        const comment = await this.repository.findById(id);
        if (!comment)
            return false;
        const deleted = await this.repository.delete(id);
        if (deleted) {
            await this.postsRepository.decrementComments(comment.post_id);
            await this.redis.del(`${this.COMMENTS_CACHE_PREFIX}${comment.post_id}`);
            if (comment.parent_id) {
                await this.repository.decrementComments(comment.parent_id);
                await this.redis.del(`comments:replies:${comment.parent_id}`);
            }
            socket_service_1.socketService.emit('comment_deleted', { id, postId: comment.post_id }, 'feed');
        }
        return deleted;
    }
}
exports.CommentsServices = CommentsServices;
//# sourceMappingURL=comments.services.js.map