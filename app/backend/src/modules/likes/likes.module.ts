import { Router } from "express";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import redisClient from "../../config/redis/redis";
import { LikesRepository } from "./likes.repository";
import { LikesServices } from "./likes.services";
import { LikesController } from "./likes.controller";
import { LikesRouter } from "./likes.routes";
import { PostsRepository } from "../posts/posts.repository";
import { CommentsRepository } from "../comments/comments.repository";

export class LikesModule {
    private readonly router: Router;

    constructor() {
        const db = new PostgresDatabase();
        const logger = new Logger();
        const repository = new LikesRepository(db as any, logger);
        const postsRepository = new PostsRepository(db as any, logger);
        const commentsRepository = new CommentsRepository(db as any, logger);

        // Notifications integration
        const { notificationsModule } = require("../../routes/index");
        const notificationsService = notificationsModule ? notificationsModule.getService() : null;

        const service = new LikesServices(repository, postsRepository, commentsRepository, notificationsService, redisClient as any, logger);
        const controller = new LikesController(service, logger);
        const routerInstance = new LikesRouter(controller);
        this.router = routerInstance.getRouter();
    }

    public getRouter(): Router {
        return this.router;
    }
}
