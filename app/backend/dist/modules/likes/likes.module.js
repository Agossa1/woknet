"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikesModule = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const redis_1 = __importDefault(require("../../config/redis/redis"));
const likes_repository_1 = require("./likes.repository");
const likes_services_1 = require("./likes.services");
const likes_controller_1 = require("./likes.controller");
const likes_routes_1 = require("./likes.routes");
const posts_repository_1 = require("../posts/posts.repository");
const comments_repository_1 = require("../comments/comments.repository");
class LikesModule {
    constructor() {
        const db = new configDB_1.default();
        const logger = new winston_1.default();
        const repository = new likes_repository_1.LikesRepository(db, logger);
        const postsRepository = new posts_repository_1.PostsRepository(db, logger);
        const commentsRepository = new comments_repository_1.CommentsRepository(db, logger);
        // Notifications integration
        const { notificationsModule } = require("../../routes/index");
        const notificationsService = notificationsModule ? notificationsModule.getService() : null;
        const service = new likes_services_1.LikesServices(repository, postsRepository, commentsRepository, notificationsService, redis_1.default, logger);
        const controller = new likes_controller_1.LikesController(service, logger);
        const routerInstance = new likes_routes_1.LikesRouter(controller);
        this.router = routerInstance.getRouter();
    }
    getRouter() {
        return this.router;
    }
}
exports.LikesModule = LikesModule;
//# sourceMappingURL=likes.module.js.map