"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.followsRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
const followsRoutes = (controller) => {
    const router = (0, express_1.Router)();
    // Toggle follow/unfollow
    router.post("/toggle", auth_middleware_1.AuthGuard.authenticate, (req, res) => controller.toggleFollow(req, res));
    // Check follow status
    router.get("/status/:profileId", auth_middleware_1.AuthGuard.authenticate, (req, res) => controller.checkStatus(req, res));
    // Get followers of a profile
    router.get("/followers/:profileId", auth_middleware_1.AuthGuard.optionalAuthenticate, (req, res) => controller.getFollowers(req, res));
    // Get profiles followed by a profile
    router.get("/following/:profileId", auth_middleware_1.AuthGuard.optionalAuthenticate, (req, res) => controller.getFollowing(req, res));
    // Get counts
    router.get("/counts/:profileId", (req, res) => controller.getCounts(req, res));
    return router;
};
exports.followsRoutes = followsRoutes;
//# sourceMappingURL=follows.routes.js.map