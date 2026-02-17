import { Router } from "express";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import { WorkspacesRepository } from "./workspaces.repository";
import { WorkspacesService } from "./workspaces.services";
import { WorkspacesController } from "./workspaces.controller";
import { WorkspacesRouter } from "./workspaces.routes";

export class WorkspacesModule {
    private readonly router: Router;

    constructor() {
        const db = new PostgresDatabase();
        const logger = new Logger();

        const repository = new WorkspacesRepository(db as any, logger);
        const service = new WorkspacesService(repository, logger);
        const controller = new WorkspacesController(service, logger);
        const routerInstance = new WorkspacesRouter(controller);

        this.router = routerInstance.getRouter();
    }

    public getRouter(): Router {
        return this.router;
    }
}
