"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharesService = void 0;
const socket_service_1 = require("../../infra/realtime/socket.service");
const notifications_types_1 = require("../notifications/notifications.types");
class SharesService {
    constructor(repository, notificationsService) {
        this.repository = repository;
        this.notificationsService = notificationsService;
    }
    async sharePost(dto) {
        const share = await this.repository.create(dto);
        // TRIGGER NOTIFICATION: POST_SHARE
        if (this.notificationsService) {
            // We need the original author ID
            const post = await this.repository.findPostById(dto.post_id);
            if (post) {
                const notification = await this.notificationsService.createNotification({
                    recipient_id: post.profile_id,
                    sender_id: dto.profile_id,
                    type: notifications_types_1.NotificationType.POST_SHARE,
                    item_id: dto.post_id,
                    content: dto.caption
                });
                if (notification) {
                    socket_service_1.socketService.emitToUser(post.profile_id, 'new_notification', notification);
                }
            }
        }
        return share;
    }
    async unsharePost(id) {
        return this.repository.delete(id);
    }
}
exports.SharesService = SharesService;
//# sourceMappingURL=shares.service.js.map