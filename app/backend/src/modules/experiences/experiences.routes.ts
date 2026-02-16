import { Router } from "express";
import { ExperiencesController } from "./experiences.controller";
import { AuthGuard } from "../../infra/middleware/auth.middleware";

export class ExperiencesRouter {
    private readonly router: Router;

    constructor(
        private readonly controller: ExperiencesController,
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post(
            '/',
            AuthGuard.authenticate,
            this.controller.createExperience
        );

        this.router.get(
            '/:id',
            AuthGuard.authenticate,
            this.controller.getExperienceById
        );

        this.router.put(
            '/:id',
            AuthGuard.authenticate,
            this.controller.updateExperience
        );

        this.router.delete(
            '/:id',
            AuthGuard.authenticate,
            this.controller.deleteExperience
        );

        this.router.get(
            '/profile/:profileId',
            AuthGuard.authenticate,
            this.controller.getExperiencesByProfileId
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}