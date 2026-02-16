import { Router } from 'express';

import { AuthGuard } from '../../infra/middleware/auth.middleware';
import { AuthController } from './auth.controller';

export class AuthRouter {
    private readonly router: Router;

    // On injecte le contrôleur, pas le service
    constructor(private readonly controller: AuthController) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post(
            '/register',

            (req, res, next) => this.controller.register(req, res, next) // Ajoute les arguments
        );

        this.router.post(
            '/login',

            (req, res, next) => this.controller.login(req, res, next)
        );

        this.router.post('/logout',
            (req, res, next) => this.controller.logout(req, res, next)
        )
        this.router.post('/refresh',
            (req, res, next) => this.controller.refreshToken(req, res, next)
        )
        this.router.post(
            '/verify',

            (req, res, next) => this.controller.verifyAccount(req, res, next)
        );

        this.router.post(
            '/verify-account',

            (req, res, next) => this.controller.verifyAccount(req, res, next)
        );

        this.router.post(
            '/resend-otp',

            (req, res, next) => this.controller.resendOtp(req, res, next)
        );

        this.router.post(
            '/resend-code-otp',

            (req, res, next) => this.controller.resendOtp(req, res, next)
        );



        this.router.post(
            '/forgot-password',
            (req, res, next) => this.controller.forgotPassword(req, res, next)
        );

        this.router.post(
            '/reset-password',
            (req, res, next) => this.controller.resetPasswordControllers(req, res, next)
        );


        this.router.put(
            '/update-password',
            AuthGuard.authenticate,
            (req, res, next) => this.controller.updatePasswordControllers(req, res, next)
        );

        this.router.get(
            '/me',
            AuthGuard.authenticate,
            (req, res, next) => this.controller.me(req, res, next)
        );

        this.router.post(
            '/complete-onboarding',
            AuthGuard.authenticate,
            (req, res, next) => this.controller.completeOnboarding(req, res, next)
        );

        this.router.get(
            '/industries',
            (req, res, next) => this.controller.getIndustries(req, res, next)
        );

        this.router.get(
            '/countries',
            (req, res, next) => this.controller.getCountries(req, res, next)
        );

        this.router.get(
            '/job-catalog',
            (req, res, next) => this.controller.getJobCatalog(req, res, next)
        );

        this.router.get(
            '/job-types',
            (req, res, next) => this.controller.getJobTypes(req, res, next)
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}