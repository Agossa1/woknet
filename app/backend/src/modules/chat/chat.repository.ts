import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import { Conversation, Message, CreateMessageDTO, ConversationParticipant } from "./chat.types";

export class ChatRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger
    ) { }

    async findConversationById(id: string): Promise<Conversation | null> {
        const sql = `SELECT * FROM conversations WHERE id = $1`;
        const result = await this.db.query<Conversation>(sql, [id]);
        return result.length > 0 ? result[0] : null;
    }

    async getUserConversations(profileId: string): Promise<any[]> {
        const sql = `
            SELECT 
                c.*,
                (
                    SELECT json_agg(json_build_object(
                        'profile_id', p.user_id,
                        'display_name', p.display_name,
                        'avatar_url', p.avatar_url
                    ))
                    FROM conversation_participants cp
                    JOIN profiles p ON p.user_id = cp.profile_id
                    WHERE cp.conversation_id = c.id
                ) as participants,
                (
                    SELECT json_build_object(
                        'id', m.id,
                        'content', m.content,
                        'type', m.type,
                        'metadata', m.metadata,
                        'created_at', m.created_at,
                        'sender_id', m.sender_id,
                        'is_read', m.is_read
                    )
                    FROM messages m
                    WHERE m.conversation_id = c.id
                    ORDER BY m.created_at DESC
                    LIMIT 1
                ) as last_message
            FROM conversations c
            JOIN conversation_participants cp_me ON cp_me.conversation_id = c.id
            WHERE cp_me.profile_id = $1
            ORDER BY c.updated_at DESC
        `;
        return this.db.query(sql, [profileId]);
    }

    async getConversationMessages(conversationId: string, profileId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
        const sql = `
            SELECT m.* 
            FROM messages m
            JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
            WHERE m.conversation_id = $1 
            AND cp.profile_id = $2
            ORDER BY m.created_at DESC 
            LIMIT $3 OFFSET $4
        `;
        return this.db.query<Message>(sql, [conversationId, profileId, limit, offset]);
    }

    async createConversation(): Promise<Conversation> {
        const sql = `INSERT INTO conversations DEFAULT VALUES RETURNING *`;
        const result = await this.db.query<Conversation>(sql);
        return result[0];
    }

    async addParticipant(conversationId: string, profileId: string): Promise<void> {
        const sql = `INSERT INTO conversation_participants (conversation_id, profile_id) VALUES ($1, $2)`;
        await this.db.query(sql, [conversationId, profileId]);
    }

    async createMessage(dto: CreateMessageDTO): Promise<Message> {
        const sql = `
            WITH inserted AS (
                INSERT INTO messages (conversation_id, sender_id, content, type, metadata)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            )
            SELECT 
                i.*,
                p.display_name as sender_name,
                p.avatar_url as sender_avatar
            FROM inserted i
            JOIN profiles p ON i.sender_id = p.user_id;
        `;
        const result = await this.db.query<Message>(sql, [
            dto.conversation_id,
            dto.sender_id,
            dto.content,
            dto.type || 'text',
            dto.metadata || {}
        ]);

        // Update conversation timestamp
        await this.db.query(`UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [dto.conversation_id]);

        return result[0];
    }

    async markMessagesAsRead(conversationId: string, profileId: string): Promise<void> {
        const sql = `
            UPDATE messages 
            SET is_read = TRUE 
            WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE
        `;
        await this.db.query(sql, [conversationId, profileId]);
    }

    async findExistingConversationBetween(profile1: string, profile2: string): Promise<string | null> {
        const sql = `
            SELECT cp1.conversation_id
            FROM conversation_participants cp1
            JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
            WHERE cp1.profile_id = $1 AND cp2.profile_id = $2
            AND (SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = cp1.conversation_id) = 2
        `;
        const result = await this.db.query<{ conversation_id: string }>(sql, [profile1, profile2]);
        return result.length > 0 ? result[0].conversation_id : null;
    }
}
