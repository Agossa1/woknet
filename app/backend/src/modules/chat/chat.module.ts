import { Router } from "express";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import { ChatRepository } from "./chat.repository";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { chatRoutes } from "./chat.routes";

export class ChatModule {
    private readonly router: Router;

    constructor() {
        const db = new PostgresDatabase();
        const logger = new Logger();
        const repository = new ChatRepository(db as any, logger);
        const service = new ChatService(repository, logger);
        const controller = new ChatController(service, logger);
        this.router = chatRoutes(controller);
    }

    public getRouter(): Router {
        return this.router;
    }
}
