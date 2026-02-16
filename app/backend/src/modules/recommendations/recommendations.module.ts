import { Router } from "express";
import { RecommendationsRouter } from "./recommendations.routes";

export class RecommendationsModule {
    private router: RecommendationsRouter;

    constructor() {
        this.router = new RecommendationsRouter();
    }

    public getRouter(): Router {
        return this.router.getRouter();
    }
}
