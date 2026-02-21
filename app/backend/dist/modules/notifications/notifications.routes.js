"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
class NotificationsRouter {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        this.router.get("/", auth_middleware_1.AuthGuard.authenticate, this.controller.getMine);
        this.router.get("/unread-count", auth_middleware_1.AuthGuard.authenticate, this.controller.getUnreadCount);
        this.router.patch("/:id/read", auth_middleware_1.AuthGuard.authenticate, this.controller.markRead);
        this.router.post("/mark-all-read", auth_middleware_1.AuthGuard.authenticate, this.controller.markAllRead);
        this.router.delete("/:id", auth_middleware_1.AuthGuard.authenticate, this.controller.delete);
    }
    getRouter() {
        return this.router;
    }
}
exports.NotificationsRouter = NotificationsRouter;
//# sourceMappingURL=notifications.routes.js.map