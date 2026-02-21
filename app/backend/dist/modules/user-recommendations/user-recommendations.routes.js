"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRecommendationsRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
class UserRecommendationsRouter {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        // Create a recommendation
        this.router.post("/", auth_middleware_1.AuthGuard.authenticate, this.controller.create.bind(this.controller));
        // Get received recommendations for a profile (Approved only)
        this.router.get("/received/:profileId", this.controller.getReceived.bind(this.controller));
        // Get recommendations sent by a profile
        this.router.get("/sent/:profileId", this.controller.getSent.bind(this.controller));
        // Get pending recommendations for currently authenticated user
        this.router.get("/pending", auth_middleware_1.AuthGuard.authenticate, this.controller.getPending.bind(this.controller));
        // Approve a recommendation
        this.router.post("/:id/approve", auth_middleware_1.AuthGuard.authenticate, this.controller.approve.bind(this.controller));
        // Reject a recommendation
        this.router.post("/:id/reject", auth_middleware_1.AuthGuard.authenticate, this.controller.reject.bind(this.controller));
        // Delete a recommendation
        this.router.delete("/:id", auth_middleware_1.AuthGuard.authenticate, this.controller.delete.bind(this.controller));
    }
    getRouter() {
        return this.router;
    }
}
exports.UserRecommendationsRouter = UserRecommendationsRouter;
//# sourceMappingURL=user-recommendations.routes.js.map