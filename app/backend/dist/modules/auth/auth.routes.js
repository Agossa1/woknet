"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
class AuthRouter {
    // On injecte le contrôleur, pas le service
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/register', (req, res, next) => this.controller.register(req, res, next) // Ajoute les arguments
        );
        this.router.post('/login', (req, res, next) => this.controller.login(req, res, next));
        this.router.post('/logout', (req, res, next) => this.controller.logout(req, res, next));
        this.router.post('/refresh', (req, res, next) => this.controller.refreshToken(req, res, next));
        this.router.post('/verify', (req, res, next) => this.controller.verifyAccount(req, res, next));
        this.router.post('/verify-account', (req, res, next) => this.controller.verifyAccount(req, res, next));
        this.router.post('/resend-otp', (req, res, next) => this.controller.resendOtp(req, res, next));
        this.router.post('/resend-code-otp', (req, res, next) => this.controller.resendOtp(req, res, next));
        this.router.post('/forgot-password', (req, res, next) => this.controller.forgotPassword(req, res, next));
        this.router.post('/reset-password', (req, res, next) => this.controller.resetPasswordControllers(req, res, next));
        this.router.put('/update-password', auth_middleware_1.AuthGuard.authenticate, (req, res, next) => this.controller.updatePasswordControllers(req, res, next));
        this.router.get('/me', auth_middleware_1.AuthGuard.authenticate, (req, res, next) => this.controller.me(req, res, next));
        this.router.post('/complete-onboarding', auth_middleware_1.AuthGuard.authenticate, (req, res, next) => this.controller.completeOnboarding(req, res, next));
        this.router.get('/industries', (req, res, next) => this.controller.getIndustries(req, res, next));
        this.router.get('/countries', (req, res, next) => this.controller.getCountries(req, res, next));
        this.router.get('/job-catalog', (req, res, next) => this.controller.getJobCatalog(req, res, next));
        this.router.get('/2fa/setup', auth_middleware_1.AuthGuard.authenticate, (req, res, next) => this.controller.setup2FA(req, res, next));
        this.router.post('/2fa/enable', auth_middleware_1.AuthGuard.authenticate, (req, res, next) => this.controller.enable2FA(req, res, next));
        this.router.post('/2fa/disable', auth_middleware_1.AuthGuard.authenticate, (req, res, next) => this.controller.disable2FA(req, res, next));
        this.router.post('/2fa/verify', (req, res, next) => this.controller.verify2FALogin(req, res, next));
        this.router.get('/job-types', (req, res, next) => this.controller.getJobTypes(req, res, next));
    }
    getRouter() {
        return this.router;
    }
}
exports.AuthRouter = AuthRouter;
//# sourceMappingURL=auth.routes.js.map