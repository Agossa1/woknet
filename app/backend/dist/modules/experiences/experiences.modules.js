"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperiencesModule = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const auth_repository_1 = require("../auth/auth.repository");
const redis_1 = __importDefault(require("../../config/redis/redis"));
const profiles_repository_1 = require("../profiles/profiles.repository");
const experiences_repository_1 = require("./experiences.repository");
const experiences_services_1 = require("./experiences.services");
const experiences_controller_1 = require("./experiences.controller");
const experiences_routes_1 = require("./experiences.routes");
class ExperiencesModule {
    constructor() {
        const db = new configDB_1.default();
        const logger = new winston_1.default();
        const authRepository = new auth_repository_1.AuthRepository(db, logger, redis_1.default);
        const profileRepository = new profiles_repository_1.ProfilesRepository(db, logger);
        const experiencesRepository = new experiences_repository_1.ExperiencesRepository(db, logger);
        const experiencesService = new experiences_services_1.ExperiencesServices(experiencesRepository, authRepository, profileRepository, logger);
        const controller = new experiences_controller_1.ExperiencesController(experiencesService, logger);
        const routerInstance = new experiences_routes_1.ExperiencesRouter(controller);
        this.router = routerInstance.getRouter();
    }
    getRouter() {
        return this.router;
    }
}
exports.ExperiencesModule = ExperiencesModule;
//# sourceMappingURL=experiences.modules.js.map