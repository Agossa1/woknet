import { Router } from "express";
import { AuthGuard } from "../../infra/middleware/auth.middleware";
import { RecommendationsController } from "./recommendations.controller";

export class RecommendationsRouter {
    private readonly router: Router;
    private readonly controller: RecommendationsController;

    constructor() {
        this.router = Router();
        this.controller = new RecommendationsController();
        this.initRoutes();
    }

    private initRoutes(): void {
        // Endpoint ultra-léger pour capturer les clics/vues
        this.router.post(
            "/track",
            AuthGuard.authenticate as any,
            this.controller.track
        );

        // Endpoint pour récupérer les suggestions de profils
        this.router.get(
            "/profiles",
            AuthGuard.authenticate as any,
            this.controller.getProfileSuggestions
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}
