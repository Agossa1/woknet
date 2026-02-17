import { Router } from "express";
import { JobSuggestionsController } from "./job-suggestions.controller";

export class JobSuggestionsRouter {
    public router: Router;

    constructor(private readonly controller: JobSuggestionsController) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Public routes for suggestions
        this.router.get('/titles', this.controller.getJobTitles);
        this.router.get('/locations', this.controller.getWorkLocations);
        this.router.get('/categories', this.controller.getCategories);
    }
}
