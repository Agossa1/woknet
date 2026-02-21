"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsModule = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const projects_repository_1 = require("./projects.repository");
const projects_services_1 = require("./projects.services");
const projects_controller_1 = require("./projects.controller");
const projects_routes_1 = require("./projects.routes");
const profiles_repository_1 = require("../profiles/profiles.repository");
const winston_1 = __importDefault(require("../../infra/logger/winston"));
class ProjectsModule {
    constructor() {
        const db = new configDB_1.default();
        const logger = new winston_1.default(); // logger is needed for ProfilesRepository? No, check constructor
        // ProfilesRepository expects (db: PostgresDatabase, logger: Logger) based on EducationsModule
        const profileRepository = new profiles_repository_1.ProfilesRepository(db, logger);
        const projectsRepository = new projects_repository_1.ProjectsRepository(db);
        // ProjectsService expects (repository, profileRepository)
        const projectsService = new projects_services_1.ProjectsService(projectsRepository, profileRepository);
        const controller = new projects_controller_1.ProjectsController(projectsService);
        const routes = new projects_routes_1.ProjectsRoutes(controller);
        this.router = routes.router;
    }
    getRouter() {
        return this.router;
    }
}
exports.ProjectsModule = ProjectsModule;
//# sourceMappingURL=projects.module.js.map