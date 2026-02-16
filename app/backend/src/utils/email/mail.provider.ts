import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

/**
 * Interface contrat : indispensable pour respecter le principe SOLID d'inversion de dépendance.
 * N'importe quel service de mail (SES, SendGrid, Mailtrap) devra implémenter cette structure.
 */
export interface MailOptions {
    from?: string;
    to: string;
    subject: string;
    html: string;
    text: string;
}

export interface MailProvider {
    send(options: MailOptions): Promise<{ messageId: string }>;
}

/**
 * Implémentation concrète via Nodemailer.
 */
export default class NodemailerProvider implements MailProvider {
    private transport;

    constructor() {
        this.transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            name: "yumi.com", // Évite la fuite du nom d'hôte local (Mac-mini-de-Ben-market.local)
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    /**
     * Utilisation d'un objet d'options pour plus de flexibilité (Best Practice)
     */
    async send({ from, to, subject, html, text }: MailOptions): Promise<{ messageId: string }> {
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