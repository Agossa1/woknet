import { Router } from "express";
import { HashtagsController } from "./hashtags.controller";
import { AuthGuard } from "../../infra/middleware/auth.middleware";

export class HashtagsRoutes {
    private router: Router;
    private controller: HashtagsController;

    constructor() {
        this.router = Router();
        this.controller = new HashtagsController();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get("/trending", AuthGuard.authenticate as any, this.controller.getTrending);
        this.router.get("/search", AuthGuard.authenticate as any, this.controller.search);
        this.router.get("/:name", AuthGuard.authenticate as any, this.controller.getDetails);
        this.router.get("/:name/posts", AuthGuard.authenticate as any, this.controller.getPostsByHashtag);
    }

    getRouter(): Router {
        return this.router;
    }
}
