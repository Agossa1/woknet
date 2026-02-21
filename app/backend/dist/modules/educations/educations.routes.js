"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EducationsRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
class EducationsRouter {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/', auth_middleware_1.AuthGuard.authenticate, this.controller.createEducation);
        this.router.get('/:id', auth_middleware_1.AuthGuard.authenticate, this.controller.getEducationById);
        this.router.put('/:id', auth_middleware_1.AuthGuard.authenticate, this.controller.updateEducation);
        this.router.delete('/:id', auth_middleware_1.AuthGuard.authenticate, this.controller.deleteEducation);
        this.router.get('/profile/:profileId', auth_middleware_1.AuthGuard.authenticate, this.controller.getEducationsByProfileId);
    }
    getRouter() {
        return this.router;
    }
}
exports.EducationsRouter = EducationsRouter;
//# sourceMappingURL=educations.routes.js.map