import { Router } from 'express';
import { AuthGuard } from '../../infra/middleware/auth.middleware';
import { ProjectsController } from './projects.controller';

export class ProjectsRoutes {
    public router: Router;
    private controller: ProjectsController;

    constructor(controller: ProjectsController) {
        this.router = Router();
        this.controller = controller;
        this.initRoutes();
    }

    private initRoutes() {
        // Create a new project
        this.router.post(
            '/',
            AuthGuard.authenticate,
            this.controller.createProject
        );

        // Get all projects for a profile
        this.router.get(
            '/profile/:profileId',
            this.controller.getProjectsByProfile
        );

        // Get a specific project by ID
        this.router.get(
            '/:projectId',
            this.controller.getProjectById
        );

        // Update a project
        this.router.put(
            '/:projectId',
            AuthGuard.authenticate,
            this.controller.updateProject
        );

        // Delete a project
        this.router.delete(
            '/:projectId',
            AuthGuard.authenticate,
            this.controller.deleteProject
        );
    }
}
