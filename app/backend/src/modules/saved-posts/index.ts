import { Router } from "express";
import { SavedPostsController } from "./saved-posts.controller";
import { SavedPostsServices } from "./saved-posts.services";
import { SavedPostsRepository } from "./saved-posts.repository";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import { AuthGuard } from "../../infra/middleware/auth.middleware";

export const createSavedPostsModule = (db: PostgresDatabase, logger: Logger) => {
    const repository = new SavedPostsRepository(db as any, logger);
    const services = new SavedPostsServices(repository);
    const controller = new SavedPostsController(services);
    const router = Router();

    router.post("/:postId/toggle", AuthGuard.authenticate, controller.toggle);
    router.get("/", AuthGuard.authenticate, controller.getSaved);

    return { router, controller, services, repository };
};
