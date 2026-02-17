import { RedisClientType } from "redis";
import Logger from "../../infra/logger/winston";
import { IFollowsRepository } from "./follows.repository";
import { ProfilesRepository } from "../profiles/profiles.repository";
import { FollowDTO, FollowerInfo } from "./follows.types";
import { socketService } from "../../infra/realtime/socket.service";

import { NotificationType } from "../notifications/notifications.types";
import { NotificationsService } from "../notifications/notifications.services";

export class FollowsServices {
    private readonly FOLLOW_CACHE_PREFIX = "follow:";

    constructor(
        private readonly repository: IFollowsRepository,
        private readonly profilesRepository: ProfilesRepository,
        private readonly notificationsService: NotificationsService | null,
        private readonly redis: RedisClientType,
        private readonly logger: Logger
    ) { }

    async toggleFollow(dto: FollowDTO): Promise<{ following: boolean }> {
        const cacheKey = `${this.FOLLOW_CACHE_PREFIX}${dto.follower_id}:${dto.following_id}`;
        const isFollowing = await this.repository.isFollowing(dto);

        if (isFollowing) {
            await this.repository.unfollow(dto);
            await this.profilesRepository.decrementFollowing(dto.follower_id);
            await this.profilesRepository.decrementFollowers(dto.following_id);
            await this.redis.del(cacheKey);

            // Real-time update
            socketService.emit('user_unfollowed', { followerId: dto.follower_id, followingId: dto.following_id });

            return { following: false };
        } else {
            await this.repository.follow(dto);
            await this.profilesRepository.incrementFollowing(dto.follower_id);
            await this.profilesRepository.incrementFollowers(dto.following_id);
            await this.redis.set(cacheKey, "true", { EX: 3600 });

            // TRIGGER NOTIFICATION: NEW_FOLLOW
            if (this.notificationsService) {
                const notification = await this.notificationsService.createNotification({
                    recipient_id: dto.following_id,
                    sender_id: dto.follower_id,
                    type: NotificationType.NEW_FOLLOW
                });
                if (notification) {
                    socketService.emitToUser(dto.following_id, 'new_notification', notification);
                }
            }

            // Real-time update (notify the person being followed)
            socketService.emit('user_followed', {
                followerId: dto.follower_id,
                followingId: dto.following_id,
                // We could fetch follower info here for a better notification
            });

            return { following: true };
        }
    }

    async getFollowers(profileId: string, currentUserId?: string): Promise<FollowerInfo[]> {
        return await this.repository.getFollowers(profileId, currentUserId);
    }

    async getFollowing(profileId: string, currentUserId?: string): Promise<FollowerInfo[]> {
        return await this.repository.getFollowing(profileId, currentUserId);
    }

    async checkFollowStatus(dto: FollowDTO): Promise<boolean> {
        const cacheKey = `${this.FOLLOW_CACHE_PREFIX}${dto.follower_id}:${dto.following_id}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) return true;

        const following = await this.repository.isFollowing(dto);
        if (following) {
            await this.redis.set(cacheKey, "true", { EX: 3600 });
        }
        return following;
    }

    async getCounts(profileId: string): Promise<{ followers: number; following: number }> {
        return await this.repository.getFollowCounts(profileId);
    }
}
