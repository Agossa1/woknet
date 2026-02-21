"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
class ProjectsRoutes {
    constructor(controller) {
        this.router = (0, express_1.Router)();
        this.controller = controller;
        this.initRoutes();
    }
    initRoutes() {
        // Create a new project
        this.router.post('/', auth_middleware_1.AuthGuard.authenticate, this.controller.createProject);
        // Get all projects for a profile
        this.router.get('/profile/:profileId', this.controller.getProjectsByProfile);
        // Get a specific project by ID
        this.router.get('/:projectId', this.controller.getProjectById);
        // Update a project
        this.router.put('/:projectId', auth_middleware_1.AuthGuard.authenticate, this.controller.updateProject);
        // Delete a project
        this.router.delete('/:projectId', auth_middleware_1.AuthGuard.authenticate, this.controller.deleteProject);
    }
}
exports.ProjectsRoutes = ProjectsRoutes;
//# sourceMappingURL=projects.routes.js.map