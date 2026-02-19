import { IDatabase } from "./languages.types";
import Logger from "../../infra/logger/winston";
import { LanguagesRepository } from "./languages.repository";
import { LanguagesService } from "./languages.service";
import { LanguagesController } from "./languages.controller";
import { LanguagesRoutes } from "./languages.routes";
import { Router } from "express";

export class LanguagesModule {
    static init(db: IDatabase, logger: Logger): Router {
        const repository = new LanguagesRepository(db, logger);
        const service = new LanguagesService(repository, logger);
        const controller = new LanguagesController(service, logger);
        return LanguagesRoutes(controller);
    }
}
