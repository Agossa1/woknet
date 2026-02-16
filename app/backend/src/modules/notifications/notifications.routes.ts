import { Router } from "express";
import { AuthGuard } from "../../infra/middleware/auth.middleware";
import { NotificationsController } from "./notifications.controller";

export class NotificationsRouter {
    private readonly router: Router;

    constructor(private readonly controller: NotificationsController) {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.get("/", AuthGuard.authenticate, this.controller.getMine);
        this.router.get("/unread-count", AuthGuard.authenticate, this.controller.getUnreadCount);
        this.router.patch("/:id/read", AuthGuard.authenticate, this.controller.markRead);
        this.router.post("/mark-all-read", AuthGuard.authenticate, this.controller.markAllRead);
        this.router.delete("/:id", AuthGuard.authenticate, this.controller.delete);
    }

    public getRouter(): Router {
        return this.router;
    }
}
