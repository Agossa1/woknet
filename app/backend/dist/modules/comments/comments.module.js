"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsModule = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const redis_1 = __importDefault(require("../../config/redis/redis"));
const comments_repository_1 = require("./comments.repository");
const comments_services_1 = require("./comments.services");
const comments_controller_1 = require("./comments.controller");
const comments_routes_1 = require("./comments.routes");
const posts_repository_1 = require("../posts/posts.repository");
class CommentsModule {
    constructor() {
        const db = new configDB_1.default();
        const logger = new winston_1.default();
        const repository = new comments_repository_1.CommentsRepository(db, logger);
        const postsRepository = new posts_repository_1.PostsRepository(db, logger);
        // Notifications integration
        const { notificationsModule } = require("../../routes/index");
        const notificationsService = notificationsModule ? notificationsModule.getService() : null;
        const service = new comments_services_1.CommentsServices(repository, postsRepository, notificationsService, redis_1.default, logger);
        const controller = new comments_controller_1.CommentsController(service, logger);
        const routerInstance = new comments_routes_1.CommentsRouter(controller);
        this.router = routerInstance.getRouter();
    }
    getRouter() {
        return this.router;
    }
}
exports.CommentsModule = CommentsModule;
//# sourceMappingURL=comments.module.js.map