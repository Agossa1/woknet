"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EducationsModule = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const auth_repository_1 = require("../auth/auth.repository");
const redis_1 = __importDefault(require("../../config/redis/redis"));
const profiles_repository_1 = require("../profiles/profiles.repository");
const educations_repository_1 = require("./educations.repository");
const educations_services_1 = require("./educations.services");
const educations_controller_1 = require("./educations.controller");
const educations_routes_1 = require("./educations.routes");
class EducationsModule {
    constructor() {
        const db = new configDB_1.default();
        const logger = new winston_1.default();
        const authRepository = new auth_repository_1.AuthRepository(db, logger, redis_1.default);
        const profileRepository = new profiles_repository_1.ProfilesRepository(db, logger);
        const educationsRepository = new educations_repository_1.EducationsRepository(db, logger);
        const educationsService = new educations_services_1.EducationsServices(educationsRepository, authRepository, profileRepository, logger);
        const controller = new educations_controller_1.EducationsController(educationsService, logger);
        const routerInstance = new educations_routes_1.EducationsRouter(controller);
        this.router = routerInstance.getRouter();
    }
    getRouter() {
        return this.router;
    }
}
exports.EducationsModule = EducationsModule;
//# sourceMappingURL=educations.module.js.map