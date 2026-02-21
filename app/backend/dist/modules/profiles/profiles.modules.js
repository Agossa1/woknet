"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilesModule = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const auth_repository_1 = require("../auth/auth.repository");
const redis_1 = __importDefault(require("../../config/redis/redis"));
const profiles_repository_1 = require("./profiles.repository");
const profiles_services_1 = require("./profiles.services");
const profiles_controller_1 = require("./profiles.controller");
const profiles_routes_1 = require("./profiles.routes");
class ProfilesModule {
    constructor() {
        const db = new configDB_1.default();
        const logger = new winston_1.default();
        const authRepository = new auth_repository_1.AuthRepository(db, logger, redis_1.default);
        const profilesRepository = new profiles_repository_1.ProfilesRepository(db, logger);
        const profileService = new profiles_services_1.ProfilesServices(profilesRepository, authRepository, logger);
        const controller = new profiles_controller_1.ProfilesController(profileService, logger);
        const routerInstance = new profiles_routes_1.ProfilesRouter(controller);
        this.router = routerInstance.getRouter();
    }
    getRouter() {
        return this.router;
    }
}
exports.ProfilesModule = ProfilesModule;
//# sourceMappingURL=profiles.modules.js.map