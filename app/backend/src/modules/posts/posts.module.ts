import { Router } from "express";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import redisClient from "../../config/redis/redis";
import { PostsRepository } from "./posts.repository";
import { PostsServices } from "./posts.services";
import { PostsController } from "./posts.controller";
import { PostsRouter } from "./posts.routes";
import { CloudinaryService } from "../../infra/storage/cloudinary.service";

export class PostsModule {
    private readonly router: Router;

    constructor() {
        const db = new PostgresDatabase();
        const logger = new Logger();
        const repository = new PostsRepository(db as any, logger);
        const cloudinaryService = new CloudinaryService(logger);
        const service = new PostsServices(repository, redisClient as any, cloudinaryService, logger);
        const controller = new PostsController(service, logger);
        const routerInstance = new PostsRouter(controller);
        this.router = routerInstance.getRouter();
    }

    public getRouter(): Router {
        return this.router;
    }
}
