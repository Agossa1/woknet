import { Router } from "express";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import { JobsRepository } from "./jobs.repository";
import { JobsService } from "./jobs.services";
import { JobsAIService } from "./jobs.ai.service";
import { JobsController } from "./jobs.controller";
import { JobsRouter } from "./jobs.routes";
import { JobSuggestionsController } from "./job-suggestions.controller";
import { JobSuggestionsRouter } from "./job-suggestions.routes";

export class JobsModule {
    private readonly router: Router;

    constructor() {
        const db = new PostgresDatabase();
        const logger = new Logger();

        const repository = new JobsRepository(db as any, logger);
        const aiService = new JobsAIService(logger);
        const service = new JobsService(repository, aiService, logger);
        const controller = new JobsController(service, logger);
        const routerInstance = new JobsRouter(controller);

        // Suggestions
        const suggestionsController = new JobSuggestionsController(db as any, logger);
        const suggestionsRouter = new JobSuggestionsRouter(suggestionsController);

        this.router = Router();
        this.router.use('/', routerInstance.getRouter());
        this.router.use('/suggestions', suggestionsRouter.router);
    }

    public getRouter(): Router {
        return this.router;
    }
}
