import { Router } from "express";
import { EducationsController } from "./educations.controller";
import { AuthGuard } from "../../infra/middleware/auth.middleware";

export class EducationsRouter {
    private readonly router: Router;

    constructor(
        private readonly controller: EducationsController,
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post(
            '/',
            AuthGuard.authenticate,
            this.controller.createEducation
        );

        this.router.get(
            '/:id',
            AuthGuard.authenticate,
            this.controller.getEducationById
        );

        this.router.put(
            '/:id',
            AuthGuard.authenticate,
            this.controller.updateEducation
        );

        this.router.delete(
            '/:id',
            AuthGuard.authenticate,
            this.controller.deleteEducation
        );

        this.router.get(
            '/profile/:profileId',
            AuthGuard.authenticate,
            this.controller.getEducationsByProfileId
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}
