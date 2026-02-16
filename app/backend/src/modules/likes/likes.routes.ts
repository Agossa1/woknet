import { Router } from "express";
import { AuthGuard } from "../../infra/middleware/auth.middleware";
import { LikesController } from "./likes.controller";

export class LikesRouter {
    private readonly router: Router;

    constructor(private readonly controller: LikesController) {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.post("/toggle", AuthGuard.authenticate, this.controller.toggle);
        this.router.get("/check/:postId", AuthGuard.authenticate, this.controller.check);
    }

    public getRouter(): Router {
        return this.router;
    }
}
