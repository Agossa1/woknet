import { Router } from "express";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import redisClient from "../../config/redis/redis";
import { PostsRepository } from "./posts.repository";
import { PostsServices } from "./posts.services";
import { PostsController } from "./posts.controller";
import { PostsRouter } from "./posts.routes";
import { CloudinaryService } from "../../infra/storage/cloudinary.service";
import { FeedRepository } from "../feeds/feed.repository";
import { FeedService } from "../feeds/feed.services";
import { RecommendationsRepository } from "../recommendations/recommendations.repository";
import { ProfilesRepository } from "../profiles/profiles.repository";

export class PostsModule {
    private readonly router: Router;

    constructor() {
        const db = new PostgresDatabase();
        const logger = new Logger();
        const repository = new PostsRepository(db as any, logger);
        const cloudinaryService = new CloudinaryService(logger);
        const feedRepository = new FeedRepository();
        const recRepository = new RecommendationsRepository();
        const profilesRepository = new ProfilesRepository(db as any, logger);
        const feedService = new FeedService(feedRepository, recRepository, profilesRepository);
        const service = new PostsServices(repository, feedRepository, redisClient as any, cloudinaryService, logger, feedService);
        
        // Warmup du cache au démarrage (non-bloquant)
        service.warmupGuestFeed();

        const controller = new PostsController(service, logger);
        const routerInstance = new PostsRouter(controller);
        this.router = routerInstance.getRouter();
    }

    public getRouter(): Router {
        return this.router;
    }
}
