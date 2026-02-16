import { Router } from "express";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import { SkillsRepository } from "./skills.repository";
import { SkillsServices } from "./skills.services";
import { SkillsController } from "./skills.controller";
import { SkillsRouter } from "./skills.routes";

export class SkillsModule {
    private readonly router: Router;
    private readonly skillsRouter: SkillsRouter;

    constructor() {
        const db = new PostgresDatabase();
        const logger = new Logger();

        const skillsRepository = new SkillsRepository(db as any, logger);
        const skillsService = new SkillsServices(skillsRepository, logger);
        const skillsController = new SkillsController(skillsService);
        this.skillsRouter = new SkillsRouter(skillsController);

        this.router = this.skillsRouter.getRouter();
    }

    public getRouter(): Router {
        return this.router;
    }

    public getProfileRouter(): Router {
        return this.skillsRouter.getProfileRouter();
    }
}
