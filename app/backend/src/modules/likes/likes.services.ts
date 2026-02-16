import { RedisClientType } from "redis";
import Logger from "../../infra/logger/winston";
import { ILikesRepository } from "./likes.repository";
import { IPostsRepository } from "../posts/posts.repository";
import { ICommentsRepository } from "../comments/comments.repository";
import { LikeDTO } from "./likes.types";
import { socketService } from "../../infra/realtime/socket.service";

import { NotificationType } from "../notifications/notifications.types";
import { NotificationsService } from "../notifications/notifications.services";

export class LikesServices {
    private readonly LIKED_CACHE_PREFIX = "liked:";

    constructor(
        private readonly repository: ILikesRepository,
        private readonly postsRepository: IPostsRepository,
        private readonly commentsRepository: ICommentsRepository,
        private readonly notificationsService: NotificationsService | null,
        private readonly redis: RedisClientType,
        private readonly logger: Logger
    ) { }

    async toggleLike(dto: LikeDTO): Promise<{ liked: boolean }> {
        const targetId = dto.post_id || dto.comment_id;
        if (!targetId) throw new Error("post_id or comment_id required");

        const cacheKey = `${this.LIKED_CACHE_PREFIX}${dto.profile_id}:${targetId}`;

        if (dto.post_id) {
            const alreadyLiked = await this.repository.isLiked(dto as any);
            let liked = false;
            let likesCount = 0;

            if (alreadyLiked) {
                await this.repository.removeLike(dto as any);
                likesCount = await this.postsRepository.decrementLikes(dto.post_id);
                await this.redis.del(cacheKey);
                await this.redis.del(`post:${dto.post_id}`);
                liked = false;
            } else {
                await this.redis.set(cacheKey, "true", { EX: 3600 });
                await this.redis.del(`post:${dto.post_id}`);
                liked = true;

                // TRIGGER NOTIFICATION: POST_LIKE
                if (this.notificationsService) {
                    const post = await this.postsRepository.findById(dto.post_id);
                    if (post) {
                        await this.notificationsService.createNotification({
                            recipient_id: post.profile_id,
                            sender_id: dto.profile_id,
                            type: NotificationType.POST_LIKE,
                            item_id: dto.post_id
                        });
                        socketService.emitToUser(post.profile_id, 'new_notification', {});
                    }
                }
            }

            // Real-time update
            socketService.emit('post_liked', { postId: dto.post_id, liked, likesCount }, 'feed');
            return { liked };
        } else {
            // Comment Like
            const alreadyLiked = await this.repository.isCommentLiked(dto as any);
            let liked = false;
            let likesCount = 0;

            if (alreadyLiked) {
                await this.repository.removeCommentLike(dto as any);
                likesCount = await this.commentsRepository.decrementLikes(dto.comment_id!);
                await this.redis.del(cacheKey);
                liked = false;
            } else {
                await this.repository.addCommentLike(dto as any);
                likesCount = await this.commentsRepository.incrementLikes(dto.comment_id!);
                await this.redis.set(cacheKey, "true", { EX: 3600 });
                liked = true;

                // TRIGGER NOTIFICATION: COMMENT_LIKE
                if (this.notificationsService) {
                    const comment = await this.commentsRepository.findById(dto.comment_id!);
                    if (comment) {
                        await this.notificationsService.createNotification({
                            recipient_id: comment.profile_id,
                            sender_id: dto.profile_id,
                            type: NotificationType.COMMENT_LIKE,
                            item_id: comment.id,
                            content: comment.post_id // We store postId in content for easier navigation
                        });
                        socketService.emitToUser(comment.profile_id, 'new_notification', {});
                    }
                }
            }

            // To efficiently find the comment on frontend, we need the postId
            const comment = await this.commentsRepository.findById(dto.comment_id!);
            const postId = comment?.post_id;
            const parentId = comment?.parent_id;

            socketService.emit('comment_liked', { commentId: dto.comment_id, liked, likesCount, postId, parentId }, 'feed');
            return { liked };
        }
    }

    async checkIfLiked(dto: LikeDTO): Promise<boolean> {
        const targetId = dto.post_id || dto.comment_id;
        if (!targetId) return false;

        const cacheKey = `${this.LIKED_CACHE_PREFIX}${dto.profile_id}:${targetId}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) return true;

        const liked = dto.post_id
            ? await this.repository.isLiked(dto as any)
            : await this.repository.isCommentLiked(dto as any);

        if (liked) {
            await this.redis.set(cacheKey, "true", { EX: 3600 });
        }
        return liked;
    }
}
