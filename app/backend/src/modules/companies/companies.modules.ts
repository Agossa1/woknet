import { Router } from "express";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import { CompaniesRepository } from "./companies.repository";
import { CompaniesService } from "./companies.services";
import { CompaniesController } from "./companies.controller";
import { CompaniesRouter } from "./companies.routes";

export class CompaniesModule {
    private readonly router: Router;

    constructor() {
        const db = new PostgresDatabase();
        const logger = new Logger();

        const repository = new CompaniesRepository(db as any, logger);
        const service = new CompaniesService(repository, logger);
        const controller = new CompaniesController(service, logger);
        const routerInstance = new CompaniesRouter(controller);

        this.router = routerInstance.getRouter();
    }

    public getRouter(): Router {
        return this.router;
    }
}
