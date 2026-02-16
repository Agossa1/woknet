import { Router } from "express";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import { AuthRepository } from "../auth/auth.repository";
import redisClient from "../../config/redis/redis";
import { ProfilesRepository } from "./profiles.repository";
import { ProfilesServices } from "./profiles.services";
import { ProfilesController } from "./profiles.controller";
import { ProfilesRouter } from "./profiles.routes";

export class ProfilesModule {
    private readonly router: Router;

    constructor() {
        const db = new PostgresDatabase();
        const logger = new Logger();
        const authRepository = new AuthRepository(db as any, logger, redisClient as any);
        const profilesRepository = new ProfilesRepository(db as any, logger);

        const profileService = new ProfilesServices(
            profilesRepository,
            authRepository,
            logger
        );

        const controller = new ProfilesController(profileService, logger);
        const routerInstance = new ProfilesRouter(controller);
        this.router = routerInstance.getRouter();
    }

    public getRouter(): Router {
        return this.router;
    }
}