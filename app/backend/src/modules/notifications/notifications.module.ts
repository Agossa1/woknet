import { Router } from "express";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import { NotificationsRepository } from "./notifications.repository";
import { NotificationsService } from "./notifications.services";
import { NotificationsController } from "./notifications.controller";
import { NotificationsRouter } from "./notifications.routes";

export class NotificationsModule {
    private readonly router: Router;
    private readonly service: NotificationsService;

    constructor() {
        const db = (new PostgresDatabase()) as any;
        const logger = new Logger();
        const repository = new NotificationsRepository(db.pool);
        this.service = new NotificationsService(repository);
        const controller = new NotificationsController(this.service, logger);
        const routerInstance = new NotificationsRouter(controller);
        this.router = routerInstance.getRouter();
    }

    public getRouter(): Router {
        return this.router;
    }

    public getService(): NotificationsService {
        return this.service;
    }
}
