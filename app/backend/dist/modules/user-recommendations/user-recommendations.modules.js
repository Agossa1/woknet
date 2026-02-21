"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRecommendationsModule = void 0;
const user_recommendations_controller_1 = require("./user-recommendations.controller");
const user_recommendations_repository_1 = require("./user-recommendations.repository");
const user_recommendations_routes_1 = require("./user-recommendations.routes");
const user_recommendations_services_1 = require("./user-recommendations.services");
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
class UserRecommendationsModule {
    constructor() {
        const database = new configDB_1.default();
        const logger = new winston_1.default();
        const repository = new user_recommendations_repository_1.UserRecommendationsRepository(database, logger);
        const services = new user_recommendations_services_1.UserRecommendationsServices(repository, logger);
        const controller = new user_recommendations_controller_1.UserRecommendationsController(services);
        this.router = new user_recommendations_routes_1.UserRecommendationsRouter(controller);
    }
    getRouter() {
        return this.router.getRouter();
    }
}
exports.UserRecommendationsModule = UserRecommendationsModule;
//# sourceMappingURL=user-recommendations.modules.js.map