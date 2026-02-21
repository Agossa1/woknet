"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 3 * 1024 * 1024 * 1024, // 3GB limit
    }
});
class PostsRouter {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        this.router.post("/", auth_middleware_1.AuthGuard.authenticate, upload.single('file'), this.controller.create);
        this.router.get("/feed", auth_middleware_1.AuthGuard.optionalAuthenticate, this.controller.getFeed);
        this.router.get("/profile/:profileId", auth_middleware_1.AuthGuard.optionalAuthenticate, this.controller.getProfilePosts);
        this.router.get("/company/:companyId", auth_middleware_1.AuthGuard.optionalAuthenticate, this.controller.getCompanyPosts);
        this.router.get("/:id", this.controller.getById);
        this.router.put("/:id", auth_middleware_1.AuthGuard.authenticate, this.controller.update);
        this.router.delete("/:id", auth_middleware_1.AuthGuard.authenticate, this.controller.delete);
    }
    getRouter() {
        return this.router;
    }
}
exports.PostsRouter = PostsRouter;
//# sourceMappingURL=posts.routes.js.map