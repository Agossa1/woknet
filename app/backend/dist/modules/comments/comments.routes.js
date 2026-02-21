"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
class CommentsRouter {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        this.router.post("/", auth_middleware_1.AuthGuard.authenticate, this.controller.create);
        this.router.get("/post/:postId", auth_middleware_1.AuthGuard.optionalAuthenticate, this.controller.getByPost);
        this.router.get("/replies/:parentId", auth_middleware_1.AuthGuard.optionalAuthenticate, this.controller.getReplies);
        this.router.put("/:id", auth_middleware_1.AuthGuard.authenticate, this.controller.update);
        this.router.delete("/:id", auth_middleware_1.AuthGuard.authenticate, this.controller.delete);
    }
    getRouter() {
        return this.router;
    }
}
exports.CommentsRouter = CommentsRouter;
//# sourceMappingURL=comments.routes.js.map