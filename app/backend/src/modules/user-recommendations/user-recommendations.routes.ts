import { Router } from "express";
import { UserRecommendationsController } from "./user-recommendations.controller";
import { AuthGuard } from "../../infra/middleware/auth.middleware";

export class UserRecommendationsRouter {
    private readonly router: Router;

    constructor(private readonly controller: UserRecommendationsController) {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes(): void {
        // Create a recommendation
        this.router.post(
            "/",
            AuthGuard.authenticate as any,
            this.controller.create.bind(this.controller)
        );

        // Get received recommendations for a profile (Approved only)
        this.router.get(
            "/received/:profileId",
            this.controller.getReceived.bind(this.controller)
        );

        // Get recommendations sent by a profile
        this.router.get(
            "/sent/:profileId",
            this.controller.getSent.bind(this.controller)
        );

        // Get pending recommendations for currently authenticated user
        this.router.get(
            "/pending",
            AuthGuard.authenticate as any,
            this.controller.getPending.bind(this.controller)
        );

        // Approve a recommendation
        this.router.post(
            "/:id/approve",
            AuthGuard.authenticate as any,
            this.controller.approve.bind(this.controller)
        );

        // Reject a recommendation
        this.router.post(
            "/:id/reject",
            AuthGuard.authenticate as any,
            this.controller.reject.bind(this.controller)
        );

        // Delete a recommendation
        this.router.delete(
            "/:id",
            AuthGuard.authenticate as any,
            this.controller.delete.bind(this.controller)
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}
