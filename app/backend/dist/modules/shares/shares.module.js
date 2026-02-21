"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharesModule = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const shares_repository_1 = require("./shares.repository");
const shares_service_1 = require("./shares.service");
const shares_controller_1 = require("./shares.controller");
const shares_routes_1 = require("./shares.routes");
class SharesModule {
    constructor() {
        const db = new configDB_1.default();
        const logger = new winston_1.default();
        const repository = new shares_repository_1.SharesRepository(db, logger);
        // Notifications integration
        const { notificationsModule } = require("../../routes/index");
        const notificationsService = notificationsModule ? notificationsModule.getService() : null;
        const service = new shares_service_1.SharesService(repository, notificationsService);
        const controller = new shares_controller_1.SharesController(service, logger);
        const routerInstance = new shares_routes_1.SharesRouter(controller);
        this.router = routerInstance.getRouter();
    }
    getRouter() {
        return this.router;
    }
}
exports.SharesModule = SharesModule;
//# sourceMappingURL=shares.module.js.map