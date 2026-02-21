"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationsRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
const recommendations_controller_1 = require("./recommendations.controller");
class RecommendationsRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.controller = new recommendations_controller_1.RecommendationsController();
        this.initRoutes();
    }
    initRoutes() {
        // Endpoint ultra-léger pour capturer les clics/vues
        this.router.post("/track", auth_middleware_1.AuthGuard.authenticate, this.controller.track);
        // Endpoint pour récupérer les suggestions de profils
        this.router.get("/profiles", auth_middleware_1.AuthGuard.authenticate, this.controller.getProfileSuggestions);
        // Recommandations de jobs basées sur le profil et les interactions
        this.router.get("/jobs", auth_middleware_1.AuthGuard.authenticate, this.controller.getJobSuggestions);
    }
    getRouter() {
        return this.router;
    }
}
exports.RecommendationsRouter = RecommendationsRouter;
//# sourceMappingURL=recommendations.routes.js.map