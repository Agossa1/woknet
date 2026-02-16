import { NotificationsRepository } from './notifications.repository';
import { CreateNotificationDTO, Notification } from './notifications.types';

export class NotificationsService {
    constructor(private repository: NotificationsRepository) { }

    async createNotification(dto: CreateNotificationDTO): Promise<Notification> {
        // Don't notify if sender is the recipient
        if (dto.sender_id === dto.recipient_id) {
            return null as any;
        }
        return this.repository.create(dto);
    }

    async getNotifications(recipientId: string, limit: number = 20, offset: number = 0): Promise<Notification[]> {
        return this.repository.findByRecipient(recipientId, limit, offset);
    }

    async markAsRead(id: string): Promise<void> {
        return this.repository.markAsRead(id);
    }

    async markAllAsRead(recipientId: string): Promise<void> {
        return this.repository.markAllAsRead(recipientId);
    }

    async getUnreadCount(recipientId: string): Promise<number> {
        return this.repository.countUnread(recipientId);
    }

    async deleteNotification(id: string): Promise<void> {
        return this.repository.delete(id);
    }
}
