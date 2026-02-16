import { Router } from "express";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import { AuthRepository } from "../auth/auth.repository";
import redisClient from "../../config/redis/redis";
import { ProfilesRepository } from "../profiles/profiles.repository";
import { EducationsRepository } from "./educations.repository";
import { EducationsServices } from "./educations.services";
import { EducationsController } from "./educations.controller";
import { EducationsRouter } from "./educations.routes";

export class EducationsModule {
    private readonly router: Router;

    constructor() {
        const db = new PostgresDatabase();
        const logger = new Logger();
        const authRepository = new AuthRepository(db as any, logger, redisClient as any);
        const profileRepository = new ProfilesRepository(db as any, logger);
        const educationsRepository = new EducationsRepository(db as any, logger);

        const educationsService = new EducationsServices(
            educationsRepository,
            authRepository,
            profileRepository,
            logger
        );

        const controller = new EducationsController(educationsService, logger);
        const routerInstance = new EducationsRouter(controller);
        this.router = routerInstance.getRouter();
    }

    public getRouter(): Router {
        return this.router;
    }
}
