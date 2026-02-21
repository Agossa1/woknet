"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentionsRepository = void 0;
class MentionsRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async createMention(mention) {
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
        const results = await this.db.query(sql, params);
        return results[0];
    }
    async getMentionsForUser(userId) {
        const sql = `SELECT * FROM mentions WHERE receiver_id = $1 ORDER BY created_at DESC`;
        return await this.db.query(sql, [userId]);
    }
}
exports.MentionsRepository = MentionsRepository;
//# sourceMappingURL=mentions.repository.js.map