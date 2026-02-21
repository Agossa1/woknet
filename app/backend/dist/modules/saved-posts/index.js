"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSavedPostsModule = void 0;
const express_1 = require("express");
const saved_posts_controller_1 = require("./saved-posts.controller");
const saved_posts_services_1 = require("./saved-posts.services");
const saved_posts_repository_1 = require("./saved-posts.repository");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
const createSavedPostsModule = (db, logger) => {
    const repository = new saved_posts_repository_1.SavedPostsRepository(db, logger);
    const services = new saved_posts_services_1.SavedPostsServices(repository);
    const controller = new saved_posts_controller_1.SavedPostsController(services);
    const router = (0, express_1.Router)();
    router.post("/:postId/toggle", auth_middleware_1.AuthGuard.authenticate, controller.toggle);
    router.get("/", auth_middleware_1.AuthGuard.authenticate, controller.getSaved);
    return { router, controller, services, repository };
};
exports.createSavedPostsModule = createSavedPostsModule;
//# sourceMappingURL=index.js.map