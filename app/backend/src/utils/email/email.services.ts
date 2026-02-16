import Logger from "../../infra/logger/winston";
import { MailProvider, MailOptions } from "./mail.provider"; // Interface/Base
import { EmailLogRepository } from "./mail.repository";
import { MailTemplateEngine } from "./mail.templates";
import NodemailerProvider from "./mail.provider";

/**
 * Interfaces simplifiées pour la clarté
 */
export interface MailContent {
    subject: string;
    text: string;
    html: string;
}

interface MailResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

export class YumiMailService {
    // On dépend de l'interface (MailProvider) et non de l'implémentation (Nodemailer)
    constructor(
        private readonly provider: MailProvider,
        private readonly logRepo: EmailLogRepository,
        private readonly logger: Logger
    ) { }

    /**
     * Centralise la logique d'envoi avec une gestion robuste des erreurs
     */
    private async process(to: string, content: MailContent): Promise<MailResponse> {
        const from = process.env.EMAIL_FROM || '"WorkNet Team" <noreply@yumi.com>';

        try {
            // 1. Envoi
            const { messageId } = await this.provider.send({
                from,
                to,
                ...content
            });

            // 2. Logging asynchrone (ne doit pas bloquer/faire échouer le retour si le mail est parti)
            this.logRepo.saveLog(to, messageId || 'unknown').catch(err =>
                this.logger.instance.error(`DB Logging failed: ${err.message}`)
            );

            this.logger.instance.info(`Email "${content.subject}" envoyé à ${to}`, { messageId });

            return { success: true, messageId };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown mail error";
            this.logger.instance.error(`Erreur d'envoi d'email à ${to}: ${errorMessage}`, { error });

            return { success: false, error: errorMessage };
        }
    }

    async sendOtpEmail(to: string, fullName: string, otpCode: string): Promise<MailResponse> {
        const template = MailTemplateEngine.getOtpTemplate(fullName, otpCode);
        return this.process(to, template);
    }

    async sendWelcomeEmail(to: string, fullName: string): Promise<MailResponse> {
        const template = MailTemplateEngine.getWelcomeTemplate(fullName);
        return this.process(to, template);
    }

    async sendPasswordResetEmail(to: string, fullName: string, code: string): Promise<MailResponse> {
        const template = MailTemplateEngine.getOtpPasswordTemplate(fullName, code);
        return this.process(to, template);
    }
}
