import { Router } from "express";
import { ProfilesController } from "./profiles.controller";
import { AuthGuard } from "../../infra/middleware/auth.middleware";





export class ProfilesRouter {
    private readonly router: Router;

    constructor(
        private readonly controller: ProfilesController,
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get(
            '/search',
            AuthGuard.authenticate,
            this.controller.searchProfiles
        );

        this.router.get(
            '/recommendations',
            AuthGuard.authenticate,
            this.controller.getRecommendedProfiles
        );

        this.router.get(
            '/get-profile/:userId',
            AuthGuard.authenticate,
            this.controller.getProfileByUserId
        );

        this.router.put(
            '/update-profile/:userId',
            AuthGuard.authenticate,
            this.controller.updateProfile
        )
    }


    public getRouter(): Router {
        return this.router;
    }
}