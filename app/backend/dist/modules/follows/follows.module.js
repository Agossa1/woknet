"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowsModule = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const redis_1 = __importDefault(require("../../config/redis/redis"));
const follows_repository_1 = require("./follows.repository");
const follows_services_1 = require("./follows.services");
const follows_controller_1 = require("./follows.controller");
const follows_routes_1 = require("./follows.routes");
const profiles_repository_1 = require("../profiles/profiles.repository");
class FollowsModule {
    constructor() {
        const db = new configDB_1.default();
        const logger = new winston_1.default();
        const repository = new follows_repository_1.FollowsRepository(db, logger);
        const profilesRepository = new profiles_repository_1.ProfilesRepository(db, logger);
        // Notifications integration
        const { notificationsModule } = require("../../routes/index");
        const notificationsService = notificationsModule ? notificationsModule.getService() : null;
        const services = new follows_services_1.FollowsServices(repository, profilesRepository, notificationsService, redis_1.default, logger);
        const controller = new follows_controller_1.FollowsController(services);
        this.router = (0, follows_routes_1.followsRoutes)(controller);
    }
    getRouter() {
        return this.router;
    }
}
exports.FollowsModule = FollowsModule;
//# sourceMappingURL=follows.module.js.map