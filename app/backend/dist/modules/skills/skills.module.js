"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillsModule = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const skills_repository_1 = require("./skills.repository");
const skills_services_1 = require("./skills.services");
const skills_controller_1 = require("./skills.controller");
const skills_routes_1 = require("./skills.routes");
class SkillsModule {
    constructor() {
        const db = new configDB_1.default();
        const logger = new winston_1.default();
        const skillsRepository = new skills_repository_1.SkillsRepository(db, logger);
        const skillsService = new skills_services_1.SkillsServices(skillsRepository, logger);
        const skillsController = new skills_controller_1.SkillsController(skillsService);
        this.skillsRouter = new skills_routes_1.SkillsRouter(skillsController);
        this.router = this.skillsRouter.getRouter();
    }
    getRouter() {
        return this.router;
    }
    getProfileRouter() {
        return this.skillsRouter.getProfileRouter();
    }
}
exports.SkillsModule = SkillsModule;
//# sourceMappingURL=skills.module.js.map