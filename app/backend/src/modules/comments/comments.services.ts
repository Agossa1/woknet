import { RedisClientType } from "redis";
import Logger from "../../infra/logger/winston";
import { ICommentsRepository } from "./comments.repository";
import { IPostsRepository } from "../posts/posts.repository";
import { Comment, CreateCommentDTO, UpdateCommentDTO } from "./comments.types";
import { socketService } from "../../infra/realtime/socket.service";

import { NotificationType } from "../notifications/notifications.types";
import { NotificationsService } from "../notifications/notifications.services";

export class CommentsServices {
    private readonly COMMENTS_CACHE_PREFIX = "comments:post:";

    constructor(
        private readonly repository: ICommentsRepository,
        private readonly postsRepository: IPostsRepository,
        private readonly notificationsService: NotificationsService | null,
        private readonly redis: RedisClientType,
        private readonly logger: Logger
    ) { }

    async createComment(dto: CreateCommentDTO): Promise<Comment> {
        const comment = await this.repository.create(dto);

        // Increment post comments count
        await this.postsRepository.incrementComments(dto.post_id);

        // Invalidate cache
        await this.redis.del(`${this.COMMENTS_CACHE_PREFIX}${dto.post_id}`);
        if (dto.parent_id) {
            await this.repository.incrementComments(dto.parent_id);
            await this.redis.del(`comments:replies:${dto.parent_id}`);
        }

        // Real-time update
        socketService.emit('new_comment', comment, 'feed');

        // TRIGGER NOTIFICATIONS
        if (this.notificationsService) {
            // Notification for Post Author
            const post = await this.postsRepository.findById(dto.post_id);
            if (post) {
                await this.notificationsService.createNotification({
                    recipient_id: post.profile_id,
                    sender_id: dto.profile_id,
                    type: NotificationType.POST_COMMENT,
                    item_id: dto.post_id,
                    content: comment.content // snippet of the comment
                });
                socketService.emitToUser(post.profile_id, 'new_notification', {});
            }

            // Notification for Original Comment Author (if Reply)
            if (dto.parent_id) {
                const parentComment = await this.repository.findById(dto.parent_id);
                if (parentComment && parentComment.profile_id !== post?.profile_id) {
                    await this.notificationsService.createNotification({
                        recipient_id: parentComment.profile_id,
                        sender_id: dto.profile_id,
                        type: NotificationType.POST_COMMENT, // Or define a specific COMMENT_REPLY type
                        item_id: dto.post_id,
                        content: comment.content
                    });
                    socketService.emitToUser(parentComment.profile_id, 'new_notification', {});
                }
            }
        }

        return comment;
    }

    async getPostComments(postId: string, currentProfileId?: string): Promise<Comment[]> {
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

    async getReplies(parentId: string, currentProfileId?: string): Promise<Comment[]> {
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

    async updateComment(id: string, dto: UpdateCommentDTO): Promise<Comment> {
        const comment = await this.repository.update(id, dto);

        // Invalidate caches
        await this.redis.del(`${this.COMMENTS_CACHE_PREFIX}${comment.post_id}`);
        if (comment.parent_id) {
            await this.redis.del(`comments:replies:${comment.parent_id}`);
        }

        socketService.emit('comment_updated', comment, 'feed');

        return comment;
    }

    async deleteComment(id: string): Promise<boolean> {
        const comment = await this.repository.findById(id);
        if (!comment) return false;

        const deleted = await this.repository.delete(id);
        if (deleted) {
            await this.postsRepository.decrementComments(comment.post_id);
            await this.redis.del(`${this.COMMENTS_CACHE_PREFIX}${comment.post_id}`);
            if (comment.parent_id) {
                await this.repository.decrementComments(comment.parent_id);
                await this.redis.del(`comments:replies:${comment.parent_id}`);
            }
            socketService.emit('comment_deleted', { id, postId: comment.post_id }, 'feed');
        }
        return deleted;
    }
}
