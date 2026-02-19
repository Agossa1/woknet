import Logger from "../../infra/logger/winston";
import { IDatabase } from "../profiles/profiles.types";

export interface Mention {
    id: string;
    sender_id: string;
    receiver_id: string;
    entity_type: 'post' | 'comment' | 'chat';
    entity_id: string;
    text_content?: string;
    created_at: Date;
}

export class MentionsRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger,
    ) { }

    async createMention(mention: Omit<Mention, 'id' | 'created_at'>): Promise<Mention> {
        const sql = `
            INSERT INTO mentions (sender_id, receiver_id, entity_type, entity_id, text_content)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const params = [
            mention.sender_id,
            mention.receiver_id,
            mention.entity_type,
            mention.entity_id,
            mention.text_content
        ];
        const results = await this.db.query<Mention>(sql, params);
        return results[0];
    }

    async getMentionsForUser(userId: string): Promise<Mention[]> {
        const sql = `SELECT * FROM mentions WHERE receiver_id = $1 ORDER BY created_at DESC`;
        return await this.db.query<Mention>(sql, [userId]);
    }
}
