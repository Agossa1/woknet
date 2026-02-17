import { Pool } from 'pg';
import { Notification, CreateNotificationDTO } from './notifications.types';

export class NotificationsRepository {
    constructor(private pool: Pool) { }

    async create(dto: CreateNotificationDTO): Promise<Notification> {
        const sql = `
            WITH inserted AS (
                INSERT INTO notifications (recipient_id, sender_id, type, item_id, content)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            )
            SELECT 
                i.*,
                p.display_name as sender_name,
                p.avatar_url as sender_avatar
            FROM inserted i
            LEFT JOIN profiles p ON i.sender_id = p.user_id;
        `;
        const values = [dto.recipient_id, dto.sender_id, dto.type, dto.item_id, dto.content];
        const { rows } = await this.pool.query(sql, values);
        return rows[0];
    }

    async findByRecipient(recipientId: string, limit: number = 20, offset: number = 0): Promise<Notification[]> {
        const sql = `
            SELECT 
                n.*,
                p.display_name as sender_name,
                p.avatar_url as sender_avatar
            FROM notifications n
            LEFT JOIN profiles p ON n.sender_id = p.user_id
            WHERE n.recipient_id = $1
            ORDER BY n.created_at DESC
            LIMIT $2 OFFSET $3;
        `;
        const { rows } = await this.pool.query(sql, [recipientId, limit, offset]);
        return rows;
    }

    async markAsRead(id: string): Promise<void> {
        const sql = `UPDATE notifications SET is_read = TRUE WHERE id = $1;`;
        await this.pool.query(sql, [id]);
    }

    async markAllAsRead(recipientId: string): Promise<void> {
        const sql = `UPDATE notifications SET is_read = TRUE WHERE recipient_id = $1 AND is_read = FALSE;`;
        await this.pool.query(sql, [recipientId]);
    }

    async countUnread(recipientId: string): Promise<number> {
        const sql = `SELECT COUNT(*) FROM notifications WHERE recipient_id = $1 AND is_read = FALSE;`;
        const { rows } = await this.pool.query(sql, [recipientId]);
        return parseInt(rows[0].count);
    }

    async delete(id: string): Promise<void> {
        const sql = `DELETE FROM notifications WHERE id = $1;`;
        await this.pool.query(sql, [id]);
    }
}
