"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashtagsRoutes = void 0;
const express_1 = require("express");
const hashtags_controller_1 = require("./hashtags.controller");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
class HashtagsRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.controller = new hashtags_controller_1.HashtagsController();
        this.initRoutes();
    }
    initRoutes() {
        this.router.get("/trending", auth_middleware_1.AuthGuard.authenticate, this.controller.getTrending);
        this.router.get("/search", auth_middleware_1.AuthGuard.authenticate, this.controller.search);
        this.router.get("/:name", auth_middleware_1.AuthGuard.authenticate, this.controller.getDetails);
        this.router.get("/:name/posts", auth_middleware_1.AuthGuard.authenticate, this.controller.getPostsByHashtag);
    }
    getRouter() {
        return this.router;
    }
}
exports.HashtagsRoutes = HashtagsRoutes;
//# sourceMappingURL=hashtags.routes.js.map