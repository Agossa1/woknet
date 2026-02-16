import { NextFunction, Request, Response } from 'express'; // Imports corrects
import { AuthServices } from "./auth.services";
// J'assume que RegisterSchema est un schéma Zod exporté
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, verifyOtpSchema } from "./auth.schema";
import GeoService from "../../infra/geo/geo.service";
import Logger from "../../infra/logger/winston";
import { AppError, InternalServerError } from '../../errors/custom-errors';
import { SecureRequest } from '../../infra/middleware/auth.middleware';

/**
 * Interface pour la réponse des services contenant les tokens
 */
interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    [key: string]: any;
}

/**
 * Wrapper pour capturer les erreurs asynchrones
 */
const AsyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export class AuthController {
    constructor(
        private readonly authService: AuthServices,

        private readonly logger: Logger
    ) { }

    private setTokenCookies(res: Response, token: AuthTokens): void {
        const isProd = process.env.NODE_ENV === 'production';

        // Bonne pratique : Extraire la config cookie
        const cookieOptions = {
            httpOnly: true,
            secure: isProd, // Nécessaire pour SameSite: None
            sameSite: isProd ? 'none' as const : 'lax' as const,
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

    register = AsyncHandler(async (req: Request, res: Response) => {
        try {
            // 1. VALIDATION RUNTIME (Sécurité)
            const validationResult = registerSchema.safeParse(req.body);

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
                ip_address: GeoService.getIpFromRequest(req),
                user_agent: req.headers['user-agent'] || 'unknown'
            };

            // 3. Appel Service
            const result = await this.authService.createUser(inputWithMeta as any);

            if (!result) {
                throw new InternalServerError("User creation failed");
            }

            this.logger.instance.info(`Nouvel utilisateur inscrit : ${result.id}`);

            return res.status(201).json({
                success: true,
                message: "Utilisateur créé avec succès",
                data: result
            });

        } catch (error: any) {
            // Si c'est une AppError, on la laisse remonter pour le global error handler ou on la gère ici
            if (error instanceof AppError) {
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
    })

    // Logique de connexion de l'utilisateur

    login = AsyncHandler(async (req: Request, res: Response) => {
        const validationResult = loginSchema.safeParse(req.body);
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
            ip_address: GeoService.getIpFromRequest(req),
            user_agent: req.headers['user-agent'] || 'unknown'
        };

        const { accessToken, refreshToken, ...user } = await this.authService.loginUser(inputWithMeta as any) as any;
        this.setTokenCookies(res, { accessToken, refreshToken });

        this.logger.instance.info(`Utilisateur connecté : ${user.id} depuis IP ${inputWithMeta.ip_address}`);
        return res.status(200).json({
            success: true,
            message: "Connexion réussie",
            data: user
        });
    })

    // Logique de déconnexion de l'utilisateur
    logout = AsyncHandler(async (req: Request, res: Response) => {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return res.status(200).json({
            success: true,
            message: "Déconnexion réussie"
        });
    })


    // Refresh token

    refreshToken = AsyncHandler(async (req: Request, res: Response) => {
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
    })

    // VerifyAccount 


    verifyAccount = AsyncHandler(async (req: Request, res: Response) => {
        this.logger.instance.info(`[AuthControllers] verifyAccount req.body: ${JSON.stringify(req.body)}`);

        // Validation des données entrantes
        const validationResult = verifyOtpSchema.safeParse(req.body);
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
            const result = await this.authService.verifyAccount(input as any);
            const { accessToken, refreshToken, ...user } = result as any;

            // Mettre à jour les cookies pour la session
            this.setTokenCookies(res, { accessToken, refreshToken });

            return res.status(200).json({
                success: true,
                message: "Compte vérifié avec succès",
                data: user
            });
        } catch (error: any) {
            if (error instanceof AppError) {
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
    })

    // Resend Code OTP  

    resendOtp = AsyncHandler(async (req: Request, res: Response) => {
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
    })

    // Forgot Password
    forgotPassword = AsyncHandler(async (req: Request, res: Response) => {
        const validationResult = forgotPasswordSchema.safeParse(req.body);
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
        await this.authService.forgotPassword(identifier!);

        // Toujours retourner un succès pour éviter de révéler l'existence du compte
        this.logger.instance.info(`Processus de réinitialisation du mot de passe initié pour : ${identifier}`);
        return res.status(200).json({
            success: true,
            message: "Si un compte existe, des instructions ont été envoyées pour réinitialiser le mot de passe."
        });
    })


    // Reset Password

    resetPasswordControllers = AsyncHandler(async (req: Request, res: Response) => {
        const validationResult = resetPasswordSchema.safeParse(req.body);
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
        await this.authService.resetPassword(identifier!, otp_code!, new_password);

        this.logger.instance.info(`Mot de passe réinitialisé pour : ${identifier}`);
        return res.status(200).json({
            success: true,
            message: "Mot de passe réinitialisé avec succès"
        });
    })


    // Update Password

    updatePasswordControllers = AsyncHandler(async (req: Request, res: Response) => {
        const validationResult = resetPasswordSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Données invalides",
                errors: validationResult.error.issues
            });
        }
        const input = validationResult.data;

        // Appel du service pour mettre à jour le mot de passe
        const { current_password, new_password } = input as any;
        await this.authService.updatePassword((req as any).user.id, current_password, new_password);
        this.logger.instance.info(`Mot de passe mis à jour pour : ${input.email}`);
        return res.status(200).json({
            success: true,
            message: "Mot de passe mis à jour avec succès"
        });
    })


    // verifyOtpPasswordControllers

    verifyOtpPasswordControllers = AsyncHandler(async (req: Request, res: Response) => {
        const validationResult = verifyOtpSchema.safeParse(req.body);
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
        await this.authService.verifyResetOpt(identifier!, input.otp_code);

        this.logger.instance.info(`OTP vérifié et mot de passe réinitialisé pour : ${input.email}`);
        return res.status(200).json({
            success: true,
            message: "OTP vérifié et mot de passe réinitialisé avec succès"
        });
    })

    me = AsyncHandler(async (req: SecureRequest, res: Response) => {
        if (!req.user) {
            throw new AppError("Non authentifié", 401);
        }

        const user = await this.authService.getUserById(req.user.id);

        return res.status(200).json({
            success: true,
            data: user
        });
    })

    completeOnboarding = AsyncHandler(async (req: SecureRequest, res: Response) => {
        if (!req.user) {
            throw new AppError("Non authentifié", 401);
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
    })
    getIndustries = AsyncHandler(async (req: Request, res: Response) => {
        const industries = await this.authService.getAllIndustries();
        return res.status(200).json({
            success: true,
            data: industries
        });
    })

    getCountries = AsyncHandler(async (req: Request, res: Response) => {
        const countries = await this.authService.getAllCountries();
        return res.status(200).json({
            success: true,
            data: countries
        });
    })

    getJobCatalog = AsyncHandler(async (req: Request, res: Response) => {
        const catalog = await this.authService.getJobCatalog();
        return res.status(200).json({
            success: true,
            data: catalog
        });
    })

    getJobTypes = AsyncHandler(async (req: Request, res: Response) => {
        const types = await this.authService.getAllJobTypes();
        return res.status(200).json({
            success: true,
            data: types
        });
    })
}