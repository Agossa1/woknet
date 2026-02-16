import { Router } from "express";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import { AuthRepository } from "../auth/auth.repository";
import redisClient from "../../config/redis/redis";
import { ProfilesRepository } from "../profiles/profiles.repository";
import { ExperiencesRepository } from "./experiences.repository";
import { ExperiencesServices } from "./experiences.services";
import { ExperiencesController } from "./experiences.controller";
import { ExperiencesRouter } from "./experiences.routes";

export class ExperiencesModule {
    private readonly router: Router;

    constructor() {
        const db = new PostgresDatabase();
        const logger = new Logger();
        const authRepository = new AuthRepository(db as any, logger, redisClient as any);
        const profileRepository = new ProfilesRepository(db as any, logger);
        const experiencesRepository = new ExperiencesRepository(db as any, logger);

        const experiencesService = new ExperiencesServices(
            experiencesRepository,
            authRepository,
            profileRepository,
            logger
        );

        const controller = new ExperiencesController(experiencesService, logger);
        const routerInstance = new ExperiencesRouter(controller);
        this.router = routerInstance.getRouter();
    }

    public getRouter(): Router {
        return this.router;
    }
}