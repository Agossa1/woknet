import { Router } from "express";
import multer from "multer";
import { AuthGuard } from "../../infra/middleware/auth.middleware";
import { PostsController } from "./posts.controller";

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 3 * 1024 * 1024 * 1024, // 3GB limit
    }
});

export class PostsRouter {
    private readonly router: Router;

    constructor(private readonly controller: PostsController) {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.post("/", AuthGuard.authenticate, upload.single('file'), this.controller.create);
        this.router.get("/feed", AuthGuard.optionalAuthenticate as any, this.controller.getFeed);
        this.router.get("/profile/:profileId", AuthGuard.optionalAuthenticate as any, this.controller.getProfilePosts);
        this.router.get("/company/:companyId", AuthGuard.optionalAuthenticate as any, this.controller.getCompanyPosts);
        this.router.get("/:id", this.controller.getById);
        this.router.put("/:id", AuthGuard.authenticate, this.controller.update);
        this.router.delete("/:id", AuthGuard.authenticate, this.controller.delete);
    }

    public getRouter(): Router {
        return this.router;
    }
}
