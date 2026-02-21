"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const chat_repository_1 = require("./chat.repository");
const chat_service_1 = require("./chat.service");
const chat_controller_1 = require("./chat.controller");
const chat_routes_1 = require("./chat.routes");
const routes_1 = require("../../routes");
class ChatModule {
    constructor() {
        const db = new configDB_1.default();
        const logger = new winston_1.default();
        const repository = new chat_repository_1.ChatRepository(db, logger);
        const service = new chat_service_1.ChatService(repository, logger, routes_1.notificationsModule.getService());
        const controller = new chat_controller_1.ChatController(service, logger);
        this.router = (0, chat_routes_1.chatRoutes)(controller);
    }
    getRouter() {
        return this.router;
    }
}
exports.ChatModule = ChatModule;
//# sourceMappingURL=chat.module.js.map