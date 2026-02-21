"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
// J'assume que RegisterSchema est un schéma Zod exporté
const auth_schema_1 = require("./auth.schema");
const geo_service_1 = __importDefault(require("../../infra/geo/geo.service"));
const custom_errors_1 = require("../../errors/custom-errors");
/**
 * Wrapper pour capturer les erreurs asynchrones
 */
const AsyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
class AuthController {
    constructor(authService, logger) {
        this.authService = authService;
        this.logger = logger;
        this.register = AsyncHandler(async (req, res) => {
            try {
                // 1. VALIDATION RUNTIME (Sécurité)
                const validationResult = auth_schema_1.registerSchema.safeParse(req.body);
                if (!validationResult.success) {
                    return res.status(400).json({
                        success: false,
                        message: "Données invalides",
                        errors: validationResult.error.issues
                    });
                }
                const input = validationResult.data;
                // 2. Enrichissement des données (sans muter req.body directement)
                const inputWithMeta = {
                    ...input,
                    ip_address: geo_service_1.default.getIpFromRequest(req),
                    user_agent: req.headers['user-agent'] || 'unknown'
                };
                // 3. Appel Service
                const result = await this.authService.createUser(inputWithMeta);
                if (!result) {
                    throw new custom_errors_1.InternalServerError("User creation failed");
                }
                this.logger.instance.info(`Nouvel utilisateur inscrit : ${result.id}`);
                return res.status(201).json({
                    success: true,
                    message: "Utilisateur créé avec succès",
                    data: result
                });
            }
            catch (error) {
                // Si c'est une AppError, on la laisse remonter pour le global error handler ou on la gère ici
                if (error instanceof custom_errors_1.AppError) {
                    return res.status(error.statusCode).json({
                        success: false,
                        message: error.message
                    });
                }
                // Gestion fine des erreurs DB
                this.logger.instance.error("Erreur Inscription:", error);
                if (error.code === 'USER_ALREADY_EXISTS' || error.message.includes('duplicate')) {
                    return res.status(409).json({
                        success: false,
                        message: "Cet email ou numéro de téléphone est déjà utilisé."
                    });
                }
                // Fallback erreur serveur
                return res.status(500).json({
                    success: false,
                    message: "Une erreur interne est survenue lors de l'inscription.",
                    error: error.message
                });
            }
        });
        // Logique de connexion de l'utilisateur
        this.login = AsyncHandler(async (req, res) => {
            const validationResult = auth_schema_1.loginSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: "Données invalides",
                    errors: validationResult.error.issues
                });
            }
            const input = validationResult.data;
            const inputWithMeta = {
                ...input,
                ip_address: geo_service_1.default.getIpFromRequest(req),
                user_agent: req.headers['user-agent'] || 'unknown'
            };
            const result = await this.authService.loginUser(inputWithMeta);
            if (result.requires2FA) {
                return res.status(200).json({
                    success: true,
                    message: "2FA requise",
                    data: {
                        requires2FA: true,
                        userId: result.userId,
                        email: result.email
                    }
                });
            }
            const { accessToken, refreshToken, ...user } = result;
            this.setTokenCookies(res, { accessToken, refreshToken });
            this.logger.instance.info(`Utilisateur connecté : ${user.id} depuis IP ${inputWithMeta.ip_address}`);
            return res.status(200).json({
                success: true,
                message: "Connexion réussie",
                data: {
                    ...user,
                    requires2FA: false
                }
            });
        });
        // Logique de déconnexion de l'utilisateur
        this.logout = AsyncHandler(async (req, res) => {
            res.clearCookie('access_token');
            res.clearCookie('refresh_token');
            return res.status(200).json({
                success: true,
                message: "Déconnexion réussie"
            });
        });
        // Refresh token
        this.refreshToken = AsyncHandler(async (req, res) => {
            const refreshToken = req.cookies['refresh_token'];
            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: "Refresh token is required"
                });
            }
            // Appel du service pour rafraîchir les tokens
            const tokens = await this.authService.refreshToken(refreshToken);
            // Mettre à jour les cookies
            this.setTokenCookies(res, tokens);
            return res.status(200).json({
                success: true,
                message: "Tokens rafraîchis avec succès",
            });
        });
        // VerifyAccount 
        this.verifyAccount = AsyncHandler(async (req, res) => {
            this.logger.instance.info(`[AuthControllers] verifyAccount req.body: ${JSON.stringify(req.body)}`);
            // Validation des données entrantes
            const validationResult = auth_schema_1.verifyOtpSchema.safeParse(req.body);
            if (!validationResult.success) {
                this.logger.instance.warn(`[AuthControllers] Validation échouée pour verifyAccount: ${JSON.stringify(validationResult.error.issues)}`);
                return res.status(400).json({
                    success: false,
                    message: "Données invalides",
                    errors: validationResult.error.issues
                });
            }
            const input = validationResult.data;
            try {
                // Appel du service pour vérifier le compte
                const result = await this.authService.verifyAccount(input);
                const { accessToken, refreshToken, ...user } = result;
                // Mettre à jour les cookies pour la session
                this.setTokenCookies(res, { accessToken, refreshToken });
                return res.status(200).json({
                    success: true,
                    message: "Compte vérifié avec succès",
                    data: user
                });
            }
            catch (error) {
                if (error instanceof custom_errors_1.AppError) {
                    return res.status(error.statusCode).json({
                        success: false,
                        message: error.message
                    });
                }
                this.logger.instance.error("Erreur Vérification Compte:", error);
                return res.status(500).json({
                    success: false,
                    message: "Une erreur est survenue lors de la vérification du compte."
                });
            }
        });
        // Resend Code OTP  
        this.resendOtp = AsyncHandler(async (req, res) => {
            const identifier = req.body.email || req.body.phone_number;
            if (!identifier) {
                return res.status(400).json({
                    success: false,
                    message: "Email ou numéro de téléphone requis"
                });
            }
            // Appel du service pour renvoyer le code OTP
            await this.authService.resendOtp(identifier);
            // Toujours retourner un succès pour éviter de révéler l'existence du compte
            this.logger.instance.info(`OTP renvoyé pour : ${identifier}`);
            return res.status(200).json({
                success: true,
                message: "Si un compte existe, un code OTP a été renvoyé."
            });
        });
        // Forgot Password
        this.forgotPassword = AsyncHandler(async (req, res) => {
            const validationResult = auth_schema_1.forgotPasswordSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: "Données invalides",
                    errors: validationResult.error.issues
                });
            }
            const { email, phone_number, ...rest } = validationResult.data;
            const identifier = email || phone_number;
            // Appel du service pour initier le processus de réinitialisation du mot de passe
            await this.authService.forgotPassword(identifier);
            // Toujours retourner un succès pour éviter de révéler l'existence du compte
            this.logger.instance.info(`Processus de réinitialisation du mot de passe initié pour : ${identifier}`);
            return res.status(200).json({
                success: true,
                message: "Si un compte existe, des instructions ont été envoyées pour réinitialiser le mot de passe."
            });
        });
        // Reset Password
        this.resetPasswordControllers = AsyncHandler(async (req, res) => {
            const validationResult = auth_schema_1.resetPasswordSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: "Données invalides",
                    errors: validationResult.error.issues
                });
            }
            const { email, phone_number, otp_code, new_password } = validationResult.data;
            const identifier = email || phone_number;
            // Appel du service pour réinitialiser le mot de passe
            await this.authService.resetPassword(identifier, otp_code, new_password);
            this.logger.instance.info(`Mot de passe réinitialisé pour : ${identifier}`);
            return res.status(200).json({
                success: true,
                message: "Mot de passe réinitialisé avec succès"
            });
        });
        // Update Password
        this.updatePasswordControllers = AsyncHandler(async (req, res) => {
            const validationResult = auth_schema_1.resetPasswordSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: "Données invalides",
                    errors: validationResult.error.issues
                });
            }
            const input = validationResult.data;
            // Appel du service pour mettre à jour le mot de passe
            const { current_password, new_password } = input;
            await this.authService.updatePassword(req.user.id, current_password, new_password);
            this.logger.instance.info(`Mot de passe mis à jour pour : ${input.email}`);
            return res.status(200).json({
                success: true,
                message: "Mot de passe mis à jour avec succès"
            });
        });
        // verifyOtpPasswordControllers
        this.verifyOtpPasswordControllers = AsyncHandler(async (req, res) => {
            const validationResult = auth_schema_1.verifyOtpSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: "Données invalides",
                    errors: validationResult.error.issues
                });
            }
            const input = validationResult.data;
            const identifier = input.email || input.phone_number;
            // Appel du service pour vérifier le code OTP et réinitialiser le mot de passe
            await this.authService.verifyResetOpt(identifier, input.otp_code);
            this.logger.instance.info(`OTP vérifié et mot de passe réinitialisé pour : ${input.email}`);
            return res.status(200).json({
                success: true,
                message: "OTP vérifié et mot de passe réinitialisé avec succès"
            });
        });
        this.me = AsyncHandler(async (req, res) => {
            if (!req.user) {
                throw new custom_errors_1.AppError("Non authentifié", 401);
            }
            const user = await this.authService.getUserById(req.user.id);
            return res.status(200).json({
                success: true,
                data: user
            });
        });
        this.completeOnboarding = AsyncHandler(async (req, res) => {
            if (!req.user) {
                throw new custom_errors_1.AppError("Non authentifié", 401);
            }
            const onboardingData = {
                userId: req.user.id,
                ...req.body
            };
            await this.authService.completeOnboarding(onboardingData);
            return res.status(200).json({
                success: true,
                message: "Onboarding complété avec succès"
            });
        });
        this.getIndustries = AsyncHandler(async (req, res) => {
            const industries = await this.authService.getAllIndustries();
            return res.status(200).json({
                success: true,
                data: industries
            });
        });
        this.getCountries = AsyncHandler(async (req, res) => {
            const countries = await this.authService.getAllCountries();
            return res.status(200).json({
                success: true,
                data: countries
            });
        });
        this.getJobCatalog = AsyncHandler(async (req, res) => {
            const catalog = await this.authService.getJobCatalog();
            return res.status(200).json({
                success: true,
                data: catalog
            });
        });
        this.getJobTypes = AsyncHandler(async (req, res) => {
            const types = await this.authService.getAllJobTypes();
            return res.status(200).json({
                success: true,
                data: types
            });
        });
        this.setup2FA = AsyncHandler(async (req, res) => {
            const { secret, otpauthUrl } = await this.authService.generate2FASecret(req.user.id);
            const qrCodeUrl = await qrcode_1.default.toDataURL(otpauthUrl);
            return res.status(200).json({
                success: true,
                data: {
                    secret,
                    qrCodeUrl
                }
            });
        });
        this.enable2FA = AsyncHandler(async (req, res) => {
            const { secret, token } = req.body;
            if (!secret || !token) {
                throw new custom_errors_1.BadRequestError("Secret and token are required");
            }
            const recoveryCodes = await this.authService.verifyAndEnable2FA(req.user.id, secret, token);
            return res.status(200).json({
                success: true,
                message: "2FA activée avec succès",
                data: { recoveryCodes }
            });
        });
        this.disable2FA = AsyncHandler(async (req, res) => {
            const { password } = req.body;
            await this.authService.disable2FA(req.user.id, password);
            return res.status(200).json({
                success: true,
                message: "2FA désactivée avec succès"
            });
        });
        this.verify2FALogin = AsyncHandler(async (req, res) => {
            const { userId, token } = req.body;
            if (!userId || !token) {
                throw new custom_errors_1.BadRequestError("User ID and token are required");
            }
            const { accessToken, refreshToken, user } = await this.authService.verify2FALogin(userId, token);
            this.setTokenCookies(res, { accessToken, refreshToken });
            return res.status(200).json({
                success: true,
                message: "Connexion 2FA réussie",
                data: user
            });
        });
    }
    setTokenCookies(res, token) {
        const isProd = process.env.NODE_ENV === 'production';
        // Bonne pratique : Extraire la config cookie
        const cookieOptions = {
            httpOnly: true,
            secure: isProd, // Nécessaire pour SameSite: None
            sameSite: isProd ? 'none' : 'lax',
            path: '/',
        };
        res.cookie('access_token', token.accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('refresh_token', token.refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map