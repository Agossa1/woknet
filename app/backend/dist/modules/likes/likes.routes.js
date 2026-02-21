"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikesRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
class LikesRouter {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        this.router.post("/toggle", auth_middleware_1.AuthGuard.authenticate, this.controller.toggle);
        this.router.get("/check/:postId", auth_middleware_1.AuthGuard.authenticate, this.controller.check);
        this.router.get("/:postId", auth_middleware_1.AuthGuard.authenticate, this.controller.getPostLikes);
    }
    getRouter() {
        return this.router;
    }
}
exports.LikesRouter = LikesRouter;
//# sourceMappingURL=likes.routes.js.map