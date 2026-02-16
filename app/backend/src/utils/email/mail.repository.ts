import  Database  from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";


export class EmailLogRepository {
    constructor(
        private readonly db: Database,
        private readonly logger: Logger
    ) { }
    async saveLog(email: string, messageId: string): Promise<void> {
        try {
            await this.db.query(`INSERT INTO email_logs (user_id, email, message_id) VALUES((SELECT id From users WHERE email = $1), $1, $2)`,
                [email, messageId])
        } catch (error) {
            this.logger.instance.error("Database logging failed", error)
        }
    }
}