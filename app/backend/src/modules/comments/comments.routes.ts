import { Router } from "express";
import { AuthGuard } from "../../infra/middleware/auth.middleware";
import { CommentsController } from "./comments.controller";

export class CommentsRouter {
    private readonly router: Router;

    constructor(private readonly controller: CommentsController) {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.post("/", AuthGuard.authenticate, this.controller.create);
        this.router.get("/post/:postId", AuthGuard.optionalAuthenticate as any, this.controller.getByPost);
        this.router.get("/replies/:parentId", AuthGuard.optionalAuthenticate as any, this.controller.getReplies);
        this.router.put("/:id", AuthGuard.authenticate, this.controller.update);
        this.router.delete("/:id", AuthGuard.authenticate, this.controller.delete);
    }

    public getRouter(): Router {
        return this.router;
    }
}
