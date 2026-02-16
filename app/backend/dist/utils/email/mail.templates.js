"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailTemplateEngine = void 0;
class MailTemplateEngine {
    /**
     * Template pour le code OTP d'inscription
     */
    static getOtpTemplate(fullName, code) {
        return {
            subject: '🔐 Votre code de vérification Yumi',
            text: `Bonjour ${fullName}, votre code de vérification est ${code}. Ne le partagez jamais.`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${this.bgColor}; padding: 40px; color: ${this.textColor};">
                    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: ${this.primaryColor}; text-align: center;">Vérification de compte</h2>
                        <p>Bonjour <strong>${fullName}</strong>,</p>
                        <p>Merci de rejoindre Yumi. Pour finaliser votre inscription, veuillez utiliser le code de sécurité suivant :</p>
                        <div style="background: ${this.bgColor}; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: ${this.primaryColor};">${code}</span>
                        </div>
                        <p style="font-size: 14px; color: #6B7280;">Ce code expirera bientôt. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
                        <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 30px 0;">
                        <p style="font-size: 12px; text-align: center; color: #9CA3AF;">© 2024 Yumi Team. Sécurité et Confiance.</p>
                    </div>
                </div>
            `
        };
    }
    /**
     * Template de bienvenue
     */
    static getWelcomeTemplate(fullName) {
        return {
            subject: '🎉 Bienvenue dans la famille Yumi !',
            text: `Bonjour ${fullName}, votre compte est vérifié. Nous sommes ravis de vous accueillir !`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${this.bgColor}; padding: 40px; color: ${this.textColor};">
                    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; text-align: center;">
                        <h1 style="color: ${this.primaryColor};">Bienvenue ${fullName} ! 🎉</h1>
                        <p style="font-size: 18px;">Votre compte a été vérifié avec succès.</p>
                        <p>Vous pouvez désormais accéder à toutes les fonctionnalités de Yumi et commencer à profiter de nos services.</p>
                        <div style="margin: 30px 0;">
                            <a href="#" style="background-color: ${this.primaryColor}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accéder à mon compte</a>
                        </div>
                        <p style="font-size: 14px; color: #6B7280;">Merci de nous faire confiance.</p>
                    </div>
                </div>
            `
        };
    }
    /**
     * Template pour la réinitialisation de mot de passe
     */
    static getOtpPasswordTemplate(fullName, code) {
        return {
            subject: '🔑 Réinitialisation de votre mot de passe Yumi',
            text: `Bonjour ${fullName}, votre code de réinitialisation est ${code}.`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${this.bgColor}; padding: 40px; color: ${this.textColor};">
                    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; border-top: 4px solid #EF4444;">
                        <h2 style="color: #EF4444; text-align: center;">Réinitialisation du mot de passe</h2>
                        <p>Bonjour <strong>${fullName}</strong>,</p>
                        <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Yumi.</p>
                        <div style="background: #FEF2F2; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0; border: 1px solid #FEE2E2;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #B91C1C;">${code}</span>
                        </div>
                        <p style="font-size: 14px;"><strong>Important :</strong> Ne partagez jamais ce code avec qui que ce soit. Nos équipes ne vous le demanderont jamais.</p>
                        <p style="font-size: 14px; color: #6B7280; margin-top: 20px;">Si vous n'avez pas demandé ce changement, nous vous conseillons de sécuriser votre compte immédiatement.</p>
                    </div>
                </div>
            `
        };
    }
}
exports.MailTemplateEngine = MailTemplateEngine;
MailTemplateEngine.primaryColor = '#4F46E5'; // Bleu Yumi
MailTemplateEngine.textColor = '#1F2937';
MailTemplateEngine.bgColor = '#F3F4F6';
//# sourceMappingURL=mail.templates.js.map