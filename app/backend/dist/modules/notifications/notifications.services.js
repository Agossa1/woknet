"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
class NotificationsService {
    constructor(repository) {
        this.repository = repository;
    }
    async createNotification(dto) {
        // Don't notify if sender is the recipient
        if (dto.sender_id === dto.recipient_id) {
            return null;
        }
        return this.repository.create(dto);
    }
    async getNotifications(recipientId, limit = 20, offset = 0) {
        return this.repository.findByRecipient(recipientId, limit, offset);
    }
    async markAsRead(id) {
        return this.repository.markAsRead(id);
    }
    async markAllAsRead(recipientId) {
        return this.repository.markAllAsRead(recipientId);
    }
    async getUnreadCount(recipientId) {
        return this.repository.countUnread(recipientId);
    }
    async deleteNotification(id) {
        return this.repository.delete(id);
    }
}
exports.NotificationsService = NotificationsService;
//# sourceMappingURL=notifications.services.js.map