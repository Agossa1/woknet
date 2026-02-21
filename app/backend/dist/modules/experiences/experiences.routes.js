"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperiencesRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
class ExperiencesRouter {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/', auth_middleware_1.AuthGuard.authenticate, this.controller.createExperience);
        this.router.get('/:id', auth_middleware_1.AuthGuard.authenticate, this.controller.getExperienceById);
        this.router.put('/:id', auth_middleware_1.AuthGuard.authenticate, this.controller.updateExperience);
        this.router.delete('/:id', auth_middleware_1.AuthGuard.authenticate, this.controller.deleteExperience);
        this.router.get('/profile/:profileId', auth_middleware_1.AuthGuard.authenticate, this.controller.getExperiencesByProfileId);
    }
    getRouter() {
        return this.router;
    }
}
exports.ExperiencesRouter = ExperiencesRouter;
//# sourceMappingURL=experiences.routes.js.map