import { Router } from "express";
import { CompaniesController } from "./companies.controller";
import { AuthGuard } from "../../infra/middleware/auth.middleware";

export class CompaniesRouter {
    private readonly router: Router;

    constructor(private readonly controller: CompaniesController) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post("/", AuthGuard.authenticate, this.controller.createCompany);
        this.router.get("/me", AuthGuard.authenticate, this.controller.getMyCompanies);
        this.router.get("/id/:id", this.controller.getCompanyById);
        this.router.get("/:slug", this.controller.getCompanyBySlug);
        this.router.put("/:id", AuthGuard.authenticate, this.controller.updateCompany);
        this.router.delete("/:id", AuthGuard.authenticate, this.controller.deleteCompany);
    }

    public getRouter(): Router {
        return this.router;
    }
}
