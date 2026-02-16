import { Router } from "express";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import { SharesRepository } from "./shares.repository";
import { SharesService } from "./shares.service";
import { SharesController } from "./shares.controller";
import { SharesRouter } from "./shares.routes";

export class SharesModule {
    private readonly router: Router;

    constructor() {
        const db = new PostgresDatabase();
        const logger = new Logger();
        const repository = new SharesRepository(db as any, logger);

        // Notifications integration
        const { notificationsModule } = require("../../routes/index");
        const notificationsService = notificationsModule ? notificationsModule.getService() : null;

        const service = new SharesService(repository, notificationsService);
        const controller = new SharesController(service, logger);
        const routerInstance = new SharesRouter(controller);
        this.router = routerInstance.getRouter();
    }

    public getRouter(): Router {
        return this.router;
    }
}
