import { Router } from "express";
import { UserRecommendationsController } from "./user-recommendations.controller";
import { UserRecommendationsRepository } from "./user-recommendations.repository";
import { UserRecommendationsRouter } from "./user-recommendations.routes";
import { UserRecommendationsServices } from "./user-recommendations.services";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";

export class UserRecommendationsModule {
    private readonly router: UserRecommendationsRouter;

    constructor() {
        const database = new PostgresDatabase();
        const logger = new Logger();
        const repository = new UserRecommendationsRepository(database, logger);
        const services = new UserRecommendationsServices(repository, logger);
        const controller = new UserRecommendationsController(services);
        this.router = new UserRecommendationsRouter(controller);
    }

    public getRouter(): Router {
        return this.router.getRouter();
    }
}
