import { Router } from "express";
import { AuthGuard } from "../../infra/middleware/auth.middleware";
import { SharesController } from "./shares.controller";

export class SharesRouter {
    private readonly router: Router;

    constructor(private readonly controller: SharesController) {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.post(
            "/",
            AuthGuard.authenticate as any,
            this.controller.share
        );

        this.router.delete(
            "/:id",
            AuthGuard.authenticate as any,
            this.controller.unshare
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}
