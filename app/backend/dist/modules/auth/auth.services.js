"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const auth_types_1 = require("./auth.types");
const custom_errors_1 = require("../../errors/custom-errors");
const geo_service_1 = __importDefault(require("../../infra/geo/geo.service"));
const node_crypto_1 = require("node:crypto");
const otplib_1 = require("otplib");
class AuthServices {
    constructor(authRepository, redis, token, logger, passwordService, emailServices) {
        this.authRepository = authRepository;
        this.redis = redis;
        this.token = token;
        this.logger = logger;
        this.passwordService = passwordService;
        this.emailServices = emailServices;
    }
    async dispatchOtp(user, otpCode) {
        // Priorité 1: Envoi via service de messagerie (email ou SMS)
        const fullName = (user.full_name || 'Utilisateur').trim();
        try {
            // Logique d'envoi de l'OTP via email ou SMS
            if (user.email) {
                const mailResponse = await this.emailServices.sendOtpEmail(user.email, fullName, otpCode);
                if (!mailResponse.success) {
                    this.logger.instance.warn(`[OTP] Échec email vers ${user.email}: ${mailResponse.error}`);
                }
                // Log de simulation d'envoi d'OTP
            }
            else if (user.phone_number) {
                this.logger.instance.info(`[OTP] Simulation envoi SMS vers ${user.phone_number} : ${otpCode}`);
            }
            else {
                this.logger.instance.error(`[OTP] Impossible d'envoyer l'OTP: Aucun contact (email/phone) pour User ID ${user.id}`);
            }
            // Stockage de l'OTP dans Redis pour validation ultérieure
            const redisKey = `otp:${user.id}`;
            await this.redis.set(redisKey, otpCode, { EX: 15 * 60 }); // Expire après 15 minutes
        }
        catch (error) {
            this.logger.instance.error(`[OTP] Erreur fatale dispatch: ${error.message}`);
        }
    }
    getPrimaryRole(roles) {
        const priority = [auth_types_1.Role.SUPERADMIN, auth_types_1.Role.ADMIN, auth_types_1.Role.MODERATEUR, auth_types_1.Role.ASSISTANT, auth_types_1.Role.USER];
        for (const role of priority) {
            if (roles && roles.includes(role))
                return role;
        }
        return auth_types_1.Role.USER;
    }
    async createUser(data) {
        try {
            // Normalisation de l'email et du téléphone pour la recherche
            const email = data.email?.toLowerCase();
            const phone = data.phone_number?.trim() || null;
            // Validation de la présence d'un email ou d'un numéro de téléphone
            if (!email && !phone) {
                throw new custom_errors_1.BadRequestError("Email or phone number is required");
            }
            // Vérification de l'existence de l'utilisateur par email ou téléphone
            const existingUser = await this.authRepository.findByIdentifier(email || phone);
            if (existingUser) {
                this.logger.instance.warn(`[AuthServices] Attempt to create user with existing email or phone: ${email || phone}`);
                throw new custom_errors_1.ConflictException("User already exists");
            }
            // Hachage du mot de passe
            const passwordHash = await this.passwordService.hashPassword(data.password);
            const otpCode = (0, node_crypto_1.randomInt)(100000, 999999).toString(); // Génère un OTP à 6 chiffres sécurisé
            // Création de l'utilisateur
            const newUser = await this.authRepository.createUser({
                ...data,
                email,
                phone_number: phone,
                password_hash: passwordHash,
                roles: [auth_types_1.Role.USER],
                is_verified: false,
                is_active: true,
                otp_code: otpCode,
                otp_expires_at: new Date(Date.now() + 15 * 60 * 1000), // OTP valide pendant 15 minutes
                registration_ip: data.ip_address,
                last_login_ip: data.ip_address
            });
            if (newUser) {
                this.dispatchOtp(newUser, otpCode);
            }
            // Sécurité : on masque les données sensibles au retour
            const { password_hash, otp_code, ...publicUser } = (newUser || {});
            // Retourner les données publiques de l'utilisateur
            return publicUser;
        }
        catch (error) {
            if (error.statusCode)
                throw error;
            this.logger.instance.error(`[AuthServices] Error creating user: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw new custom_errors_1.BadRequestError("Failed to create user");
        }
    }
    // Logique de connexion de l'utilisateur
    async loginUser(data) {
        try {
            // Normalisation de l'email et du téléphone pour la recherche
            const email = data.email?.toLowerCase();
            const phone = data.phone_number?.trim() || null;
            // Validation de la présence d'un email ou d'un numéro de téléphone
            if (!email && !phone) {
                throw new custom_errors_1.BadRequestError("Email or phone number is required");
            }
            // Rechercher l'utilisateur par email ou téléphone
            const user = await this.authRepository.findByIdentifier(email || phone);
            if (!user) {
                this.logger.instance.warn(`[AuthServices] Login attempt with non-existent identifier: ${email || phone}`);
                throw new custom_errors_1.BadRequestError("Invalid credentials");
            }
            // Vérifier le mot de passe
            const passwordMatch = await this.passwordService.comparePassword(data.password, user.password_hash);
            if (!passwordMatch) {
                this.logger.instance.warn(`[AuthServices] Failed login attempt for User ID ${user.id} with incorrect password`);
                throw new custom_errors_1.BadRequestError("Invalid credentials");
            }
            // Verifier si le compte de l'utilisateur est desactivé ou non 
            if (!user.is_active) {
                this.logger.instance.warn(`[AuthServices] Attempt to login with deactivated account: ${user.id}`);
                throw new custom_errors_1.BadRequestError("Account is deactivated");
            }
            //  Objet de payload pour les tokens d'accès et de rafraîchissement 
            const tokenPayload = {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone_number: user.phone_number,
                role: this.getPrimaryRole(user.roles)
            };
            // Metadata de connexion (IP, User Agent, Geo, etc.) à implémenter ici
            const metadata = data.ip_address && data.user_agent
                ? await geo_service_1.default.getConnectionMetadata(data.ip_address, data.user_agent)
                : undefined;
            // Mettre à jour la dernière connexion de l'utilisateur avec les métadonnées
            await this.authRepository.updateLastLogin(user.id, data.ip_address, metadata);
            // Vérifier si la 2FA est activée
            if (user.two_factor_enabled) {
                return {
                    requires2FA: true,
                    userId: user.id,
                    email: user.email
                };
            }
            // Générer les tokens d'accès et de rafraîchissement
            const accessToken = this.token.generateAccessToken(tokenPayload);
            const refreshToken = this.token.generateRefreshToken({ id: user.id });
            // Sécurité : on masque les données sensibles au retour
            const { password_hash, otp_code, two_factor_secret, two_factor_recovery_codes, ...publicUser } = user;
            // Retourner les données publiques de l'utilisateur avec les tokens d'accès et de rafraîchissement
            return {
                ...publicUser,
                accessToken,
                refreshToken,
                requires2FA: false
            };
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            throw new custom_errors_1.InternalServerError("Connexion échouée");
        }
    }
    // Logout logic to be implemented here
    async logoutUser(userId, accessToken) {
        try {
            await this.authRepository.updateRefreshToken(userId, "");
            const decoded = this.token.decode(accessToken);
            const timeLeft = decoded.exp - Math.floor(Date.now() / 1000);
            if (timeLeft > 0) {
                const blacklistKey = `blacklist:accessToken:${accessToken}`;
                await this.redis.set(blacklistKey, 'blacklisted', { EX: timeLeft });
            }
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            throw new custom_errors_1.InternalServerError("Failed to logout user");
        }
    }
    // Logique de refresh token à implémenter ici
    async refreshToken(refreshToken) {
        try {
            const decode = this.token.verifyRefreshToken(refreshToken);
            if (!decode) {
                this.logger.instance.warn(`[AuthServices] Invalid refresh token attempt`);
                throw new custom_errors_1.BadRequestError("Invalid refresh token");
            }
            const userId = decode.sub || decode.id;
            const user = await this.authRepository.findById(userId);
            if (!user || !user.is_active) {
                throw new custom_errors_1.UnauthorizedException("Session expired or user not found");
            }
            // Objet de payload pour les tokens d'accès et de rafraîchissement
            const tokenPayload = {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                phone_number: user.phone_number,
                role: this.getPrimaryRole(user.roles)
            };
            // Générer de nouveaux tokens d'accès et de rafraîchissement
            const newAccessToken = this.token.generateAccessToken(tokenPayload);
            const newRefreshToken = this.token.generateRefreshToken({ id: user.id });
            // Optionnel : Invalider l'ancien refresh token dans Redis
            await this.authRepository.saveRefreshToken(user.id, newRefreshToken);
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`[AuthServices] Refresh token failed: ${error.message}`, error);
            throw new custom_errors_1.InternalServerError("Failed to refresh token");
        }
    }
    // Logique de vérification OTP à implémenter ici
    async verifyAccount(dto) {
        try {
            // Normalisation de l'email et du téléphone pour la recherche
            const email = dto.email?.toLowerCase();
            const phone = dto.phone_number?.trim() || null;
            // Validation de la présence d'un email ou d'un numéro de téléphone
            if (!email && !phone) {
                throw new custom_errors_1.BadRequestError("Email or phone number is required");
            }
            // Rechercher l'utilisateur par email ou téléphone
            const user = await this.authRepository.findByIdentifier(email || phone);
            if (!user) {
                this.logger.instance.warn(`[AuthServices] OTP verification attempt with non-existent identifier: ${email || phone}`);
                throw new custom_errors_1.BadRequestError("Invalid credentials");
            }
            if (user.is_verified) {
                this.logger.instance.warn(`[AuthServices] Verification attempt for already verified account: ${email || phone}`);
                throw new custom_errors_1.BadRequestError("Account is already verified");
            }
            // Verification de l'OTP
            if (user.otp_code !== dto.otp_code) {
                this.logger.instance.warn(`[AuthServices] Invalid OTP code for ${email || phone}. Expected: ${user.otp_code}, Got: ${dto.otp_code}`);
                throw new custom_errors_1.BadRequestError("Invalid OTP code");
            }
            // Vérifier si l'OTP est expiré
            if (new Date() > new Date(user.otp_expires_at)) {
                this.logger.instance.warn(`[AuthServices] OTP expired for ${email || phone}. Expired at: ${user.otp_expires_at}`);
                throw new custom_errors_1.BadRequestError("OTP code has expired");
            }
            // Mettre à jour l'utilisateur pour marquer le compte comme vérifié
            await this.authRepository.verifyUserAccount(user.id, {
                is_verified: true,
                otp_code: null,
                otp_expires_at: null,
                verified_at: new Date()
            });
            // Générer des tokens apres vérification réussie
            const tokenPayload = {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                phone_number: user.phone_number,
                role: this.getPrimaryRole(user.roles)
            };
            // Générer les tokens d'accès et de rafraîchissement
            const accessToken = this.token.generateAccessToken(tokenPayload);
            const refreshToken = this.token.generateRefreshToken({ id: user.id });
            // Envoie de l'email de bienvenue après vérification réussie
            if (user.email) {
                await this.emailServices.sendWelcomeEmail(user.email, user.full_name);
            }
            const { password_hash, ...sufeUser } = user;
            // Retourner les données publiques de l'utilisateur avec les tokens d'accès et de rafraîchissement
            return {
                ...sufeUser,
                accessToken,
                refreshToken
            };
        }
        catch (error) {
            if (error.statusCode)
                throw error;
            throw new custom_errors_1.InternalServerError("Failed to verify account");
        }
    }
    // Resend OTP logic to be implemented here
    async resendOtp(identifier) {
        try {
            const email = identifier?.includes('@') ? identifier.toLowerCase() : null;
            const phone_number = !identifier?.includes('@') ? identifier?.trim() : null;
            if (!email && !phone_number) {
                throw new custom_errors_1.BadRequestError("Email or phone number is required");
            }
            const user = await this.authRepository.findByIdentifier(email || phone_number);
            if (!user) {
                this.logger.instance.warn(`[AuthServices] Resend OTP attempt with non-existent identifier: ${email || phone_number}`);
                throw new custom_errors_1.BadRequestError("Invalid credentials");
            }
            if (user.is_verified) {
                throw new custom_errors_1.BadRequestError("Account is already verified");
            }
            // Verifie si un otp est generer il ya 60 secondes
            const now = new Date();
            const expiration = new Date(user.otp_expires_at);
            const creationDate = new Date(expiration.getTime() - 10 * 60 * 1000); // OTP valide pendant 10 minutes
            const secondsSinceCreation = (now.getTime() - creationDate.getTime()) / 1000;
            if (secondsSinceCreation < 60) {
                throw new custom_errors_1.BadRequestError("OTP was recently sent. Please wait before requesting a new one.");
            }
            // Générer un nouveau code OTP sécurisé
            const newOtpCode = (0, node_crypto_1.randomInt)(100000, 999999).toString();
            await this.authRepository.updateOtp(user.id, {
                otp_code: newOtpCode,
                otp_expires_at: new Date(Date.now() + 15 * 60 * 1000) // OTP valide pendant 15 minutes
            });
            // Dispatch le nouvel OTP
            this.dispatchOtp(user, newOtpCode);
        }
        catch (error) {
            if (error.statusCode)
                throw error;
            throw new custom_errors_1.InternalServerError("Failed to resend OTP");
        }
    }
    // Forgot password logic to be implemented here
    async forgotPassword(identifier) {
        try {
            const email = identifier?.includes('@') ? identifier.toLowerCase() : null;
            const phone_number = !identifier?.includes('@') ? identifier?.trim() : null;
            if (!email && !phone_number) {
                throw new custom_errors_1.BadRequestError("Email or phone number is required");
            }
            const user = await this.authRepository.findByIdentifier(email || phone_number);
            if (!user) {
                this.logger.instance.warn(`[AuthServices] Forgot password attempt with non-existent identifier: ${email || phone_number}`);
                throw new custom_errors_1.BadRequestError("Invalid credentials");
            }
            const resetToken = (0, node_crypto_1.randomInt)(100000, 999999).toString(); // Génère un token de réinitialisation sécurisé
            await this.authRepository.saveResetToken(user.email || user.id, resetToken);
            if (user.email) {
                await this.emailServices.sendPasswordResetEmail(user.email, user.full_name, resetToken);
            }
        }
        catch (error) {
            if (error.statusCode)
                throw error;
            throw new custom_errors_1.InternalServerError("Failed to process forgot password request");
        }
    }
    // Reset password logic to be implemented here
    async resetPassword(identifier, resetToken, newPassword) {
        try {
            const email = identifier?.includes('@') ? identifier.toLowerCase() : null;
            const phone_number = !identifier?.includes('@') ? identifier?.trim() : null;
            if (!email && !phone_number) {
                throw new custom_errors_1.BadRequestError("Email or phone number is required");
            }
            const user = await this.authRepository.findByIdentifier(email || phone_number);
            if (!user) {
                this.logger.instance.warn(`[AuthServices] Reset password attempt with non-existent identifier: ${email || phone_number}`);
                throw new custom_errors_1.BadRequestError("Invalid credentials");
            }
            // Verifier le token de réinitialisation
            const storedToken = await this.authRepository.getResetToken(user.email || user.id);
            if (storedToken !== resetToken) {
                throw new custom_errors_1.BadRequestError("Invalid or expired reset token");
            }
            // Hachage du nouveau mot de passe
            const passwordHash = await this.passwordService.hashPassword(newPassword);
            await this.authRepository.updatePassword(user.id, passwordHash);
            // Invalider le token de réinitialisation après utilisation
            await this.authRepository.revoqueRefreshToken(user.email || user.id);
        }
        catch (error) {
            if (error.statusCode)
                throw error;
            throw new custom_errors_1.InternalServerError("Failed to reset password");
        }
    }
    // Verifier l'OTP pour la réinitialisation du mot de passe
    async verifyResetOpt(identfier, token) {
        try {
            const email = identfier?.includes('@') ? identfier.toLowerCase() : null;
            const phone_number = !identfier?.includes('@') ? identfier?.trim() : null;
            if (!email && !phone_number) {
                throw new custom_errors_1.BadRequestError("Email or phone number is required");
            }
            const user = await this.authRepository.findByIdentifier(email || phone_number);
            if (!user) {
                this.logger.instance.warn(`[AuthServices] Verify reset OTP attempt with non-existent identifier: ${email || phone_number}`);
                throw new custom_errors_1.BadRequestError("Invalid credentials");
            }
            const storedToken = await this.authRepository.getResetToken(user.email || user.id);
            if (storedToken !== token) {
                throw new custom_errors_1.BadRequestError("Invalid or expired OTP code");
            }
            return;
        }
        catch (error) {
            if (error.statusCode)
                throw error;
            throw new custom_errors_1.InternalServerError("Failed to verify reset OTP");
        }
    }
    // Logic for updating user password
    async updatePassword(userId, currentPassword, newPassword) {
        try {
            const user = await this.authRepository.findById(userId);
            if (!user) {
                this.logger.instance.warn(`[AuthServices] Update password attempt for non-existent User ID: ${userId}`);
                throw new custom_errors_1.BadRequestError("User not found");
            }
            // Vérifier le mot de passe actuel
            const passwordMatch = await this.passwordService.comparePassword(currentPassword, user.password_hash);
            if (!passwordMatch) {
                this.logger.instance.warn(`[AuthServices] Failed update password attempt for User ID ${user.id} with incorrect current password`);
                throw new custom_errors_1.BadRequestError("Current password is incorrect");
            }
            // Hachage du nouveau mot de passe
            const newPasswordHash = await this.passwordService.hashPassword(newPassword);
            await this.authRepository.updatePassword(user.id, newPasswordHash);
        }
        catch (error) {
            if (error.statusCode)
                throw error;
            throw new custom_errors_1.InternalServerError("Failed to update password");
        }
    }
    async getUserById(id) {
        const user = await this.authRepository.findById(id);
        if (!user) {
            throw new custom_errors_1.AppError("Utilisateur introuvable", 404);
        }
        const { password_hash, otp_code, ...publicUser } = user;
        return publicUser;
    }
    async completeOnboarding(dto) {
        try {
            await this.authRepository.completeOnboarding(dto);
            this.logger.instance.info(`[AuthServices] Onboarding completed for User ID: ${dto.userId}`);
        }
        catch (error) {
            if (error.statusCode)
                throw error;
            throw new custom_errors_1.InternalServerError("Failed to complete onboarding");
        }
    }
    async getAllIndustries() {
        try {
            return await this.authRepository.getAllIndustries();
        }
        catch (error) {
            throw new custom_errors_1.InternalServerError("Failed to fetch industries");
        }
    }
    async getAllCountries() {
        try {
            return await this.authRepository.getAllCountries();
        }
        catch (error) {
            throw new custom_errors_1.InternalServerError("Failed to fetch countries");
        }
    }
    async getJobCatalog() {
        try {
            return await this.authRepository.getJobCatalog();
        }
        catch (error) {
            throw new custom_errors_1.InternalServerError("Failed to fetch job catalog");
        }
    }
    async getAllJobTypes() {
        try {
            return await this.authRepository.getAllJobTypes();
        }
        catch (error) {
            throw new custom_errors_1.InternalServerError("Failed to fetch job types");
        }
    }
    // Two-Factor Authentication (2FA)
    async generate2FASecret(userId) {
        const user = await this.authRepository.findById(userId);
        if (!user)
            throw new custom_errors_1.BadRequestError("User not found");
        const secret = (0, otplib_1.generateSecret)();
        const otpauthUrl = (0, otplib_1.generateURI)({
            issuer: 'WorkNet',
            label: user.email,
            secret
        });
        return { secret, otpauthUrl };
    }
    async verifyAndEnable2FA(userId, secret, token) {
        const result = await (0, otplib_1.verify)({ token, secret });
        if (!result.valid)
            throw new custom_errors_1.BadRequestError("Code de vérification invalide");
        // Generate recovery codes
        const recoveryCodes = Array.from({ length: 8 }, () => (0, node_crypto_1.randomInt)(100000, 999999).toString());
        await this.authRepository.updateTwoFactorSecret(userId, secret, recoveryCodes);
        await this.authRepository.updateTwoFactorStatus(userId, true);
        return recoveryCodes;
    }
    async disable2FA(userId, password) {
        const user = await this.authRepository.findById(userId);
        if (!user)
            throw new custom_errors_1.BadRequestError("User not found");
        if (password) {
            const isPasswordValid = await this.passwordService.comparePassword(password, user.password_hash);
            if (!isPasswordValid)
                throw new custom_errors_1.BadRequestError("Mot de passe invalide");
        }
        await this.authRepository.updateTwoFactorStatus(userId, false);
    }
    async verify2FALogin(userId, token) {
        const user = await this.authRepository.findById(userId);
        if (!user || !user.two_factor_enabled || !user.two_factor_secret) {
            throw new custom_errors_1.BadRequestError("2FA non activée pour cet utilisateur");
        }
        const result = await (0, otplib_1.verify)({ token, secret: user.two_factor_secret });
        if (!result.valid) {
            throw new custom_errors_1.BadRequestError("Code 2FA invalide");
        }
        const tokenPayload = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone_number: user.phone_number,
            role: this.getPrimaryRole(user.roles)
        };
        const accessToken = this.token.generateAccessToken(tokenPayload);
        const refreshToken = this.token.generateRefreshToken({ id: user.id });
        await this.authRepository.saveRefreshToken(user.id, refreshToken);
        const { password_hash, otp_code, two_factor_secret, two_factor_recovery_codes, ...publicUser } = user;
        return { accessToken, refreshToken, user: publicUser };
    }
}
exports.AuthServices = AuthServices;
//# sourceMappingURL=auth.services.js.map