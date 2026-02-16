import { RedisClientType } from "redis";
import { AuthRepository } from "./auth.repository";
import { TokenManager } from "../../config/tokens/token-manager";
import Logger from "../../infra/logger/winston";
import { CreateUserDTO, LoginDTO, OnboardingDTO, Role, User, verifyOtpDTO } from "./auth.types";
import { BadRequestError, ConflictException, InternalServerError, UnauthorizedException, AppError } from "../../errors/custom-errors";
import { PasswordService } from "../../infra/services/passwords/passwordServices";
import { YumiMailService } from "../../utils/email/email.services";
import GeoService from "../../infra/geo/geo.service";
import { randomInt } from "node:crypto";


export class AuthServices {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly redis: RedisClientType,
        private readonly token: TokenManager,
        private readonly logger: Logger,
        private readonly passwordService: PasswordService,
        private readonly emailServices: YumiMailService
    ) { }
    private async dispatchOtp(user: Partial<User>, otpCode: string): Promise<void> {
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
            } else if (user.phone_number) {
                this.logger.instance.info(`[OTP] Simulation envoi SMS vers ${user.phone_number} : ${otpCode}`);
            } else {
                this.logger.instance.error(`[OTP] Impossible d'envoyer l'OTP: Aucun contact (email/phone) pour User ID ${user.id}`);
            }

            // Stockage de l'OTP dans Redis pour validation ultérieure
            const redisKey = `otp:${user.id}`;
            await this.redis.set(redisKey, otpCode, { EX: 15 * 60 }); // Expire après 15 minutes
        } catch (error: any) {
            this.logger.instance.error(`[OTP] Erreur fatale dispatch: ${error.message}`);
        }
    }

    private getPrimaryRole(roles: Role[]): Role {
        const priority = [Role.SUPERADMIN, Role.ADMIN, Role.MODERATEUR, Role.ASSISTANT, Role.USER];
        for (const role of priority) {
            if (roles && roles.includes(role)) return role;
        }
        return Role.USER;
    }


    async createUser(data: CreateUserDTO): Promise<Partial<User>> {
        try {

            // Normalisation de l'email et du téléphone pour la recherche
            const email = data.email?.toLowerCase();
            const phone = data.phone_number?.trim() || null;

            // Validation de la présence d'un email ou d'un numéro de téléphone
            if (!email && !phone) {
                throw new BadRequestError("Email or phone number is required");

            }

            // Vérification de l'existence de l'utilisateur par email ou téléphone
            const existingUser = await this.authRepository.findByIdentifier(email || phone!);
            if (existingUser) {
                this.logger.instance.warn(`[AuthServices] Attempt to create user with existing email or phone: ${email || phone}`);
                throw new ConflictException("User already exists");
            }

            // Hachage du mot de passe
            const passwordHash = await this.passwordService.hashPassword(data.password);
            const otpCode = randomInt(100000, 999999).toString(); // Génère un OTP à 6 chiffres sécurisé

            // Création de l'utilisateur
            const newUser = await this.authRepository.createUser({
                ...data,
                email,
                phone_number: phone,
                password_hash: passwordHash,
                roles: [Role.USER],
                is_verified: false,
                is_active: true,
                otp_code: otpCode,
                otp_expires_at: new Date(Date.now() + 15 * 60 * 1000), // OTP valide pendant 15 minutes
                registration_ip: data.ip_address,
                last_login_ip: data.ip_address
            } as any)

            if (newUser) {
                this.dispatchOtp(newUser, otpCode);
            }

            // Sécurité : on masque les données sensibles au retour
            const { password_hash, otp_code, ...publicUser } = (newUser || {}) as any;
            // Retourner les données publiques de l'utilisateur
            return publicUser;
        } catch (error: any) {
            if (error.statusCode) throw error;
            this.logger.instance.error(`[AuthServices] Error creating user: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw new BadRequestError("Failed to create user");
        }
    }

    // Logique de connexion de l'utilisateur

    async loginUser(data: LoginDTO): Promise<User> {
        try {

            // Normalisation de l'email et du téléphone pour la recherche
            const email = data.email?.toLowerCase();
            const phone = data.phone_number?.trim() || null;
            // Validation de la présence d'un email ou d'un numéro de téléphone
            if (!email && !phone) {
                throw new BadRequestError("Email or phone number is required");
            }

            // Rechercher l'utilisateur par email ou téléphone
            const user = await this.authRepository.findByIdentifier(email || phone!);
            if (!user) {
                this.logger.instance.warn(`[AuthServices] Login attempt with non-existent identifier: ${email || phone}`);
                throw new BadRequestError("Invalid credentials");
            }

            // Vérifier le mot de passe
            const passwordMatch = await this.passwordService.comparePassword(data.password, user.password_hash);
            if (!passwordMatch) {
                this.logger.instance.warn(`[AuthServices] Failed login attempt for User ID ${user.id} with incorrect password`);
                throw new BadRequestError("Invalid credentials");
            }

            // Verifier si le compte de l'utilisateur est desactivé ou non 

            if (!user.is_active) {
                this.logger.instance.warn(`[AuthServices] Attempt to login with deactivated account: ${user.id}`);
                throw new BadRequestError("Account is deactivated");
            }


            //  Objet de payload pour les tokens d'accès et de rafraîchissement 
            const tokenPayload = {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone_number: user.phone_number,
                role: this.getPrimaryRole(user.roles)
            }

            // Générer les tokens d'accès et de rafraîchissement
            const accessToken = this.token.generateAccessToken(tokenPayload as any);
            const refreshToken = this.token.generateRefreshToken({ id: user.id } as any);

            // Metadata de connexion (IP, User Agent, Geo, etc.) à implémenter ici
            const metadata = data.ip_address && data.user_agent
                ? await GeoService.getConnectionMetadata(data.ip_address, data.user_agent)
                : undefined;

            // Mettre à jour la dernière connexion de l'utilisateur avec les métadonnées
            await this.authRepository.updateLastLogin(user.id, data.ip_address, metadata);

            // Sécurité : on masque les données sensibles au retour
            const { password_hash, otp_code, ...publicUser } = user as any;
            // Retourner les données publiques de l'utilisateur avec les tokens d'accès et de rafraîchissement
            return {
                ...publicUser,
                accessToken,
                refreshToken
            } as any;

        } catch (error: any) {
            if (error.statusCode) {
                throw error;
            }
            throw new InternalServerError("Connexion échouée");
        }
    }

    // Logout logic to be implemented here
    async logoutUser(userId: string, accessToken: string): Promise<void> {
        try {
            await this.authRepository.updateRefreshToken(userId, "");
            const decoded = this.token.decode(accessToken);
            const timeLeft = decoded.exp - Math.floor(Date.now() / 1000);
            if (timeLeft > 0) {
                const blacklistKey = `blacklist:accessToken:${accessToken}`;
                await this.redis.set(blacklistKey, 'blacklisted', { EX: timeLeft });
            }

        } catch (error: any) {
            if (error.statusCode) {
                throw error;
            }
            throw new InternalServerError("Failed to logout user");
        }
    }

    // Logique de refresh token à implémenter ici

    async refreshToken(refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
        try {
            const decode = this.token.verifyRefreshToken(refreshToken);
            if (!decode) {
                this.logger.instance.warn(`[AuthServices] Invalid refresh token attempt`);
                throw new BadRequestError("Invalid refresh token");
            }

            const userId = decode.sub || (decode as any).id;
            const user = await this.authRepository.findById(userId);
            if (!user || !user.is_active) {
                throw new UnauthorizedException("Session expired or user not found");
            }

            // Objet de payload pour les tokens d'accès et de rafraîchissement
            const tokenPayload = {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                phone_number: user.phone_number,
                role: this.getPrimaryRole(user.roles)

            }

            // Générer de nouveaux tokens d'accès et de rafraîchissement
            const newAccessToken = this.token.generateAccessToken(tokenPayload as any);
            const newRefreshToken = this.token.generateRefreshToken({ id: user.id } as any);

            // Optionnel : Invalider l'ancien refresh token dans Redis
            await this.authRepository.saveRefreshToken(user.id, newRefreshToken);
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        } catch (error: any) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`[AuthServices] Refresh token failed: ${error.message}`, error);
            throw new InternalServerError("Failed to refresh token")
        }
    }

    // Logique de vérification OTP à implémenter ici

    async verifyAccount(dto: verifyOtpDTO): Promise<void> {
        try {
            // Normalisation de l'email et du téléphone pour la recherche
            const email = dto.email?.toLowerCase();
            const phone = dto.phone_number?.trim() || null;
            // Validation de la présence d'un email ou d'un numéro de téléphone
            if (!email && !phone) {
                throw new BadRequestError("Email or phone number is required");
            }

            // Rechercher l'utilisateur par email ou téléphone
            const user = await this.authRepository.findByIdentifier(email || phone!);
            if (!user) {
                this.logger.instance.warn(`[AuthServices] OTP verification attempt with non-existent identifier: ${email || phone}`);
                throw new BadRequestError("Invalid credentials");
            }

            if (user.is_verified) {
                this.logger.instance.warn(`[AuthServices] Verification attempt for already verified account: ${email || phone}`);
                throw new BadRequestError("Account is already verified");
            }
            // Verification de l'OTP

            if ((user as any).otp_code !== dto.otp_code) {
                this.logger.instance.warn(`[AuthServices] Invalid OTP code for ${email || phone}. Expected: ${(user as any).otp_code}, Got: ${dto.otp_code}`);
                throw new BadRequestError("Invalid OTP code");
            }
            // Vérifier si l'OTP est expiré
            if (new Date() > new Date((user as any).otp_expires_at)) {
                this.logger.instance.warn(`[AuthServices] OTP expired for ${email || phone}. Expired at: ${(user as any).otp_expires_at}`);
                throw new BadRequestError("OTP code has expired");
            }

            // Mettre à jour l'utilisateur pour marquer le compte comme vérifié
            await this.authRepository.verifyUserAccount(user.id, {
                is_verified: true,
                otp_code: null,
                otp_expires_at: null,
                verified_at: new Date()
            } as any);

            // Générer des tokens apres vérification réussie
            const tokenPayload = {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                phone_number: user.phone_number,
                role: this.getPrimaryRole(user.roles)
            };

            // Générer les tokens d'accès et de rafraîchissement
            const accessToken = this.token.generateAccessToken(tokenPayload as any);

            const refreshToken = this.token.generateRefreshToken({ id: user.id } as any);

            // Envoie de l'email de bienvenue après vérification réussie
            if (user.email) {
                await this.emailServices.sendWelcomeEmail(user.email, user.full_name);
            }

            const { password_hash, ...sufeUser } = user as any;
            // Retourner les données publiques de l'utilisateur avec les tokens d'accès et de rafraîchissement
            return {
                ...sufeUser,
                accessToken,
                refreshToken
            } as any;
        } catch (error: any) {
            if (error.statusCode) throw error;
            throw new InternalServerError("Failed to verify account");
        }
    }

    // Resend OTP logic to be implemented here

    async resendOtp(identifier: string): Promise<void> {
        try {
            const email = identifier?.includes('@') ? identifier.toLowerCase() : null;
            const phone_number = !identifier?.includes('@') ? identifier?.trim() : null;

            if (!email && !phone_number) {
                throw new BadRequestError("Email or phone number is required");
            }

            const user = await this.authRepository.findByIdentifier(email || phone_number!);
            if (!user) {
                this.logger.instance.warn(`[AuthServices] Resend OTP attempt with non-existent identifier: ${email || phone_number}`);
                throw new BadRequestError("Invalid credentials");
            }

            if (user.is_verified) {
                throw new BadRequestError("Account is already verified");
            }

            // Verifie si un otp est generer il ya 60 secondes

            const now = new Date();
            const expiration = new Date((user as any).otp_expires_at);
            const creationDate = new Date(expiration.getTime() - 10 * 60 * 1000); // OTP valide pendant 10 minutes

            const secondsSinceCreation = (now.getTime() - creationDate.getTime()) / 1000;
            if (secondsSinceCreation < 60) {
                throw new BadRequestError("OTP was recently sent. Please wait before requesting a new one.");
            }

            // Générer un nouveau code OTP sécurisé
            const newOtpCode = randomInt(100000, 999999).toString();
            await this.authRepository.updateOtp(user.id, {
                otp_code: newOtpCode,
                otp_expires_at: new Date(Date.now() + 15 * 60 * 1000) // OTP valide pendant 15 minutes
            } as any);

            // Dispatch le nouvel OTP
            this.dispatchOtp(user, newOtpCode);
        } catch (error: any) {
            if (error.statusCode) throw error;
            throw new InternalServerError("Failed to resend OTP");
        }
    }

    // Forgot password logic to be implemented here

    async forgotPassword(identifier: string): Promise<void> {
        try {
            const email = identifier?.includes('@') ? identifier.toLowerCase() : null;
            const phone_number = !identifier?.includes('@') ? identifier?.trim() : null;

            if (!email && !phone_number) {
                throw new BadRequestError("Email or phone number is required");
            }
            const user = await this.authRepository.findByIdentifier(email || phone_number!);
            if (!user) {
                this.logger.instance.warn(`[AuthServices] Forgot password attempt with non-existent identifier: ${email || phone_number}`);
                throw new BadRequestError("Invalid credentials");
            }
            const resetToken = randomInt(100000, 999999).toString(); // Génère un token de réinitialisation sécurisé
            await this.authRepository.saveResetToken(user.email || user.id, resetToken);
            if (user.email) {
                await this.emailServices.sendPasswordResetEmail(user.email, user.full_name, resetToken);
            }
        } catch (error: any) {
            if (error.statusCode) throw error;
            throw new InternalServerError("Failed to process forgot password request");
        }
    }

    // Reset password logic to be implemented here

    async resetPassword(identifier: string, resetToken: string, newPassword: string): Promise<void> {
        try {
            const email = identifier?.includes('@') ? identifier.toLowerCase() : null;
            const phone_number = !identifier?.includes('@') ? identifier?.trim() : null;

            if (!email && !phone_number) {
                throw new BadRequestError("Email or phone number is required");
            }
            const user = await this.authRepository.findByIdentifier(email || phone_number!);
            if (!user) {
                this.logger.instance.warn(`[AuthServices] Reset password attempt with non-existent identifier: ${email || phone_number}`);
                throw new BadRequestError("Invalid credentials");
            }

            // Verifier le token de réinitialisation
            const storedToken = await this.authRepository.getResetToken(user.email || user.id);
            if (storedToken !== resetToken) {
                throw new BadRequestError("Invalid or expired reset token");
            }

            // Hachage du nouveau mot de passe
            const passwordHash = await this.passwordService.hashPassword(newPassword);
            await this.authRepository.updatePassword(user.id, passwordHash);

            // Invalider le token de réinitialisation après utilisation
            await this.authRepository.revoqueRefreshToken(user.email || user.id);
        }
        catch (error: any) {
            if (error.statusCode) throw error;
            throw new InternalServerError("Failed to reset password");
        }
    }

    // Verifier l'OTP pour la réinitialisation du mot de passe
    async verifyResetOpt(identfier: string, token: string): Promise<void> {
        try {
            const email = identfier?.includes('@') ? identfier.toLowerCase() : null;
            const phone_number = !identfier?.includes('@') ? identfier?.trim() : null;

            if (!email && !phone_number) {
                throw new BadRequestError("Email or phone number is required");
            }
            const user = await this.authRepository.findByIdentifier(email || phone_number!);
            if (!user) {
                this.logger.instance.warn(`[AuthServices] Verify reset OTP attempt with non-existent identifier: ${email || phone_number}`);
                throw new BadRequestError("Invalid credentials");
            }
            const storedToken = await this.authRepository.getResetToken(user.email || user.id);
            if (storedToken !== token) {
                throw new BadRequestError("Invalid or expired OTP code");
            }

            return;
        } catch (error: any) {
            if (error.statusCode) throw error;
            throw new InternalServerError("Failed to verify reset OTP");

        }
    }


    // Logic for updating user password

    async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        try {
            const user = await this.authRepository.findById(userId);
            if (!user) {
                this.logger.instance.warn(`[AuthServices] Update password attempt for non-existent User ID: ${userId}`);
                throw new BadRequestError("User not found");
            }

            // Vérifier le mot de passe actuel
            const passwordMatch = await this.passwordService.comparePassword(currentPassword, user.password_hash);
            if (!passwordMatch) {
                this.logger.instance.warn(`[AuthServices] Failed update password attempt for User ID ${user.id} with incorrect current password`);
                throw new BadRequestError("Current password is incorrect");
            }
            // Hachage du nouveau mot de passe
            const newPasswordHash = await this.passwordService.hashPassword(newPassword);
            await this.authRepository.updatePassword(user.id, newPasswordHash);
        }
        catch (error: any) {
            if (error.statusCode) throw error;
            throw new InternalServerError("Failed to update password");
        }
    }

    async getUserById(id: string): Promise<User> {
        const user = await this.authRepository.findById(id);
        if (!user) {
            throw new AppError("Utilisateur introuvable", 404);
        }
        const { password_hash, otp_code, ...publicUser } = user as any;
        return publicUser;
    }

    async completeOnboarding(dto: OnboardingDTO): Promise<void> {
        try {
            await this.authRepository.completeOnboarding(dto);
            this.logger.instance.info(`[AuthServices] Onboarding completed for User ID: ${dto.userId}`);
        } catch (error: any) {
            if (error.statusCode) throw error;
            throw new InternalServerError("Failed to complete onboarding");
        }
    }
    async getAllIndustries(): Promise<any[]> {
        try {
            return await this.authRepository.getAllIndustries();
        } catch (error: any) {
            throw new InternalServerError("Failed to fetch industries");
        }
    }

    async getAllCountries(): Promise<any[]> {
        try {
            return await this.authRepository.getAllCountries();
        } catch (error: any) {
            throw new InternalServerError("Failed to fetch countries");
        }
    }

    async getJobCatalog(): Promise<any[]> {
        try {
            return await this.authRepository.getJobCatalog();
        } catch (error: any) {
            throw new InternalServerError("Failed to fetch job catalog");
        }
    }

    async getAllJobTypes(): Promise<any[]> {
        try {
            return await this.authRepository.getAllJobTypes();
        } catch (error: any) {
            throw new InternalServerError("Failed to fetch job types");
        }
    }
}