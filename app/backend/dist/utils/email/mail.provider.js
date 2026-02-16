"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Implémentation concrète via Nodemailer.
 */
class NodemailerProvider {
    constructor() {
        this.transport = nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
    /**
     * Utilisation d'un objet d'options pour plus de flexibilité (Best Practice)
     */
    async send({ from, to, subject, html, text }) {
        // Le fallback de l'expéditeur est géré par le Service, mais on peut mettre une sécurité ici
        const info = await this.transport.sendMail({
            from: from || process.env.EMAIL_USER,
            to,
            subject,
            html,
            text
        });
        return { messageId: info.messageId };
    }
}
exports.default = NodemailerProvider;
//# sourceMappingURL=mail.provider.js.map