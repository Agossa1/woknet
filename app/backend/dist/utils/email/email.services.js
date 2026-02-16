"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YumiMailService = void 0;
const mail_templates_1 = require("./mail.templates");
class YumiMailService {
    // On dépend de l'interface (MailProvider) et non de l'implémentation (Nodemailer)
    constructor(provider, logRepo, logger) {
        this.provider = provider;
        this.logRepo = logRepo;
        this.logger = logger;
    }
    /**
     * Centralise la logique d'envoi avec une gestion robuste des erreurs
     */
    async process(to, content) {
        const from = process.env.SMTP_FROM || '"Yumi Team" <noreply@yumi.com>';
        try {
            // 1. Envoi
            const { messageId } = await this.provider.send({
                from,
                to,
                ...content
            });
            // 2. Logging asynchrone (ne doit pas bloquer/faire échouer le retour si le mail est parti)
            this.logRepo.saveLog(to, messageId || 'unknown').catch(err => this.logger.instance.error(`DB Logging failed: ${err.message}`));
            this.logger.instance.info(`Email "${content.subject}" envoyé à ${to}`, { messageId });
            return { success: true, messageId };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown mail error";
            this.logger.instance.error(`Erreur d'envoi d'email à ${to}: ${errorMessage}`, { error });
            return { success: false, error: errorMessage };
        }
    }
    async sendOtpEmail(to, fullName, otpCode) {
        const template = mail_templates_1.MailTemplateEngine.getOtpTemplate(fullName, otpCode);
        return this.process(to, template);
    }
    async sendWelcomeEmail(to, fullName) {
        const template = mail_templates_1.MailTemplateEngine.getWelcomeTemplate(fullName);
        return this.process(to, template);
    }
    async sendPasswordResetEmail(to, fullName, code) {
        const template = mail_templates_1.MailTemplateEngine.getOtpPasswordTemplate(fullName, code);
        return this.process(to, template);
    }
}
exports.YumiMailService = YumiMailService;
//# sourceMappingURL=email.services.js.map