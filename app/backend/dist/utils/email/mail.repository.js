"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailLogRepository = void 0;
class EmailLogRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async saveLog(email, messageId) {
        try {
            await this.db.query(`INSERT INTO email_logs (user_id, email, message_id) VALUES((SELECT id From users WHERE email = $1), $1, $2)`, [email, messageId]);
        }
        catch (error) {
            this.logger.instance.error("Database logging failed", error);
        }
    }
}
exports.EmailLogRepository = EmailLogRepository;
//# sourceMappingURL=mail.repository.js.map