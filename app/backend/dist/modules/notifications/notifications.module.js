"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const notifications_repository_1 = require("./notifications.repository");
const notifications_services_1 = require("./notifications.services");
const notifications_controller_1 = require("./notifications.controller");
const notifications_routes_1 = require("./notifications.routes");
class NotificationsModule {
    constructor() {
        const db = (new configDB_1.default());
        const logger = new winston_1.default();
        const repository = new notifications_repository_1.NotificationsRepository(db.pool);
        this.service = new notifications_services_1.NotificationsService(repository);
        const controller = new notifications_controller_1.NotificationsController(this.service, logger);
        const routerInstance = new notifications_routes_1.NotificationsRouter(controller);
        this.router = routerInstance.getRouter();
    }
    getRouter() {
        return this.router;
    }
    getService() {
        return this.service;
    }
}
exports.NotificationsModule = NotificationsModule;
//# sourceMappingURL=notifications.module.js.map