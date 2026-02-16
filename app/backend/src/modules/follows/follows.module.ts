import { Router } from "express";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import redisClient from "../../config/redis/redis";
import { FollowsRepository } from "./follows.repository";
import { FollowsServices } from "./follows.services";
import { FollowsController } from "./follows.controller";
import { followsRoutes } from "./follows.routes";
import { ProfilesRepository } from "../profiles/profiles.repository";

export class FollowsModule {
    private readonly router: Router;

    constructor() {
        const db = new PostgresDatabase();
        const logger = new Logger();
        const repository = new FollowsRepository(db as any, logger);
        const profilesRepository = new ProfilesRepository(db as any, logger);

        // Notifications integration
        const { notificationsModule } = require("../../routes/index");
        const notificationsService = notificationsModule ? notificationsModule.getService() : null;

        const services = new FollowsServices(repository, profilesRepository, notificationsService, redisClient as any, logger);
        const controller = new FollowsController(services);
        this.router = followsRoutes(controller);
    }

    public getRouter(): Router {
        return this.router;
    }
}
