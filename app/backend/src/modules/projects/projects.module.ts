import { Router } from "express";
import PostgresDatabase from "../../config/databases/configDB"
import { ProjectsRepository } from "./projects.repository";
import { ProjectsService } from "./projects.services";
import { ProjectsController } from "./projects.controller";
import { ProjectsRoutes } from "./projects.routes";
import { ProfilesRepository } from "../profiles/profiles.repository";
import Logger from "../../infra/logger/winston";

export class ProjectsModule {
    private readonly router: Router;

    constructor() {
        const db = new PostgresDatabase();
        const logger = new Logger(); // logger is needed for ProfilesRepository? No, check constructor

        // ProfilesRepository expects (db: PostgresDatabase, logger: Logger) based on EducationsModule
        const profileRepository = new ProfilesRepository(db, logger);

        const projectsRepository = new ProjectsRepository(db);

        // ProjectsService expects (repository, profileRepository)
        const projectsService = new ProjectsService(projectsRepository, profileRepository);

        const controller = new ProjectsController(projectsService);
        const routes = new ProjectsRoutes(controller);

        this.router = routes.router;
    }

    public getRouter(): Router {
        return this.router;
    }
}
