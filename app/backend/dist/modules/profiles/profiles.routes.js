"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilesRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
class ProfilesRouter {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/search', auth_middleware_1.AuthGuard.authenticate, this.controller.searchProfiles);
        this.router.get('/recommendations', auth_middleware_1.AuthGuard.authenticate, this.controller.getRecommendedProfiles);
        this.router.get('/get-profile/:userId', auth_middleware_1.AuthGuard.authenticate, this.controller.getProfileByUserId);
        this.router.put('/update-profile/:userId', auth_middleware_1.AuthGuard.authenticate, this.controller.updateProfile);
    }
    getRouter() {
        return this.router;
    }
}
exports.ProfilesRouter = ProfilesRouter;
//# sourceMappingURL=profiles.routes.js.map