"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharesRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
class SharesRouter {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        this.router.post("/", auth_middleware_1.AuthGuard.authenticate, this.controller.share);
        this.router.delete("/:id", auth_middleware_1.AuthGuard.authenticate, this.controller.unshare);
    }
    getRouter() {
        return this.router;
    }
}
exports.SharesRouter = SharesRouter;
//# sourceMappingURL=shares.routes.js.map