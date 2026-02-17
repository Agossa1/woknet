import { Router } from "express";
import { JobsController } from "./jobs.controller";
import { AuthGuard } from "../../infra/middleware/auth.middleware";

export class JobsRouter {
    private readonly router: Router;

    constructor(private readonly controller: JobsController) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Public routes
        this.router.get("/", this.controller.getAllJobs);
        this.router.get("/slug/:slug", this.controller.getJobBySlug);
        this.router.get("/:id", this.controller.getJobById);
        this.router.get("/company/:companyId", this.controller.getJobsByCompany);

        // Protected routes (require authentication)
        this.router.post("/", AuthGuard.authenticate, this.controller.createJob);
        this.router.put("/:id", AuthGuard.authenticate, this.controller.updateJob);
        this.router.delete("/:id", AuthGuard.authenticate, this.controller.deleteJob);

        // AI generation route (protected)
        this.router.post("/generate/description", AuthGuard.authenticate, this.controller.generateDescription);
    }

    public getRouter(): Router {
        return this.router;
    }
}
