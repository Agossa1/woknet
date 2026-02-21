"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowsServices = void 0;
const socket_service_1 = require("../../infra/realtime/socket.service");
const notifications_types_1 = require("../notifications/notifications.types");
class FollowsServices {
    constructor(repository, profilesRepository, notificationsService, redis, logger) {
        this.repository = repository;
        this.profilesRepository = profilesRepository;
        this.notificationsService = notificationsService;
        this.redis = redis;
        this.logger = logger;
        this.FOLLOW_CACHE_PREFIX = "follow:";
    }
    async toggleFollow(dto) {
        const cacheKey = `${this.FOLLOW_CACHE_PREFIX}${dto.follower_id}:${dto.following_id}`;
        const isFollowing = await this.repository.isFollowing(dto);
        if (isFollowing) {
            await this.repository.unfollow(dto);
            await this.profilesRepository.decrementFollowing(dto.follower_id);
            await this.profilesRepository.decrementFollowers(dto.following_id);
            await this.redis.del(cacheKey);
            // Real-time update
            socket_service_1.socketService.emit('user_unfollowed', { followerId: dto.follower_id, followingId: dto.following_id });
            return { following: false };
        }
        else {
            await this.repository.follow(dto);
            await this.profilesRepository.incrementFollowing(dto.follower_id);
            await this.profilesRepository.incrementFollowers(dto.following_id);
            await this.redis.set(cacheKey, "true", { EX: 3600 });
            // TRIGGER NOTIFICATION: NEW_FOLLOW
            if (this.notificationsService) {
                const notification = await this.notificationsService.createNotification({
                    recipient_id: dto.following_id,
                    sender_id: dto.follower_id,
                    type: notifications_types_1.NotificationType.NEW_FOLLOW
                });
                if (notification) {
                    socket_service_1.socketService.emitToUser(dto.following_id, 'new_notification', notification);
                }
            }
            // Real-time update (notify the person being followed)
            socket_service_1.socketService.emit('user_followed', {
                followerId: dto.follower_id,
                followingId: dto.following_id,
                // We could fetch follower info here for a better notification
            });
            return { following: true };
        }
    }
    async getFollowers(profileId, currentUserId) {
        return await this.repository.getFollowers(profileId, currentUserId);
    }
    async getFollowing(profileId, currentUserId) {
        return await this.repository.getFollowing(profileId, currentUserId);
    }
    async checkFollowStatus(dto) {
        const cacheKey = `${this.FOLLOW_CACHE_PREFIX}${dto.follower_id}:${dto.following_id}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return true;
        const following = await this.repository.isFollowing(dto);
        if (following) {
            await this.redis.set(cacheKey, "true", { EX: 3600 });
        }
        return following;
    }
    async getCounts(profileId) {
        return await this.repository.getFollowCounts(profileId);
    }
}
exports.FollowsServices = FollowsServices;
//# sourceMappingURL=follows.services.js.map