import { Router } from "express";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import redisClient from "../../config/redis/redis";
import { CommentsRepository } from "./comments.repository";
import { CommentsServices } from "./comments.services";
import { CommentsController } from "./comments.controller";
import { CommentsRouter } from "./comments.routes";
import { PostsRepository } from "../posts/posts.repository";

export class CommentsModule {
    private readonly router: Router;

    constructor() {
        const db = new PostgresDatabase();
        const logger = new Logger();
        const repository = new CommentsRepository(db as any, logger);
        const postsRepository = new PostsRepository(db as any, logger);

        // Notifications integration
        const { notificationsModule } = require("../../routes/index");
        const notificationsService = notificationsModule ? notificationsModule.getService() : null;

        const service = new CommentsServices(repository, postsRepository, notificationsService, redisClient as any, logger);
        const controller = new CommentsController(service, logger);
        const routerInstance = new CommentsRouter(controller);
        this.router = routerInstance.getRouter();
    }

    public getRouter(): Router {
        return this.router;
    }
}
