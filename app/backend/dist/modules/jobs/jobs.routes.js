"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
class JobsRouter {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Public routes
        this.router.get("/", this.controller.getAllJobs);
        this.router.get("/slug/:slug", this.controller.getJobBySlug);
        this.router.get("/:id", this.controller.getJobById);
        this.router.get("/company/:companyId", this.controller.getJobsByCompany);
        // Protected routes (require authentication)
        this.router.post("/", auth_middleware_1.AuthGuard.authenticate, this.controller.createJob);
        this.router.put("/:id", auth_middleware_1.AuthGuard.authenticate, this.controller.updateJob);
        this.router.delete("/:id", auth_middleware_1.AuthGuard.authenticate, this.controller.deleteJob);
        // AI generation route (protected)
        this.router.post("/generate/description", auth_middleware_1.AuthGuard.authenticate, this.controller.generateDescription);
    }
    getRouter() {
        return this.router;
    }
}
exports.JobsRouter = JobsRouter;
//# sourceMappingURL=jobs.routes.js.map