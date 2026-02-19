import { IDatabase } from "./featured-content.types";
import Logger from "../../infra/logger/winston";
import { FeaturedContentRepository } from "./featured-content.repository";
import { FeaturedContentService } from "./featured-content.service";
import { FeaturedContentController } from "./featured-content.controller";
import { FeaturedContentRoutes } from "./featured-content.routes";
import { Router } from "express";

export class FeaturedContentModule {
    static init(db: IDatabase, logger: Logger): Router {
        const repository = new FeaturedContentRepository(db, logger);
        const service = new FeaturedContentService(repository, logger);
        const controller = new FeaturedContentController(service, logger);
        return FeaturedContentRoutes(controller);
    }
}
