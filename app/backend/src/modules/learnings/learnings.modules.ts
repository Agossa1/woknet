import { Router } from "express";
import { LearningsRepository } from "./learnings.repository";
import { LearningsServices } from "./learnings.services";
import { LearningsController } from "./learnings.controller";
import { LearningsRoutes } from "./learnings.routes";
import { LearningsMiddleware } from "./learnings.middleware";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";

export class LearningsModule {
    private router: Router;

    constructor() {
        const db = new PostgresDatabase();
        const logger = new Logger();

        // Initialization
        const repository = new LearningsRepository(db, logger);
        const middleware = new LearningsMiddleware(repository);
        const service = new LearningsServices(repository, logger);
        const controller = new LearningsController(service, logger);
        const routes = new LearningsRoutes(controller, middleware);

        this.router = routes.getRouter();
    }

    public getRouter(): Router {
        return this.router;
    }
}
