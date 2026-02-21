"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsModule = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const redis_1 = __importDefault(require("../../config/redis/redis"));
const posts_repository_1 = require("./posts.repository");
const posts_services_1 = require("./posts.services");
const posts_controller_1 = require("./posts.controller");
const posts_routes_1 = require("./posts.routes");
const cloudinary_service_1 = require("../../infra/storage/cloudinary.service");
const feed_repository_1 = require("../feeds/feed.repository");
const feed_services_1 = require("../feeds/feed.services");
const recommendations_repository_1 = require("../recommendations/recommendations.repository");
const profiles_repository_1 = require("../profiles/profiles.repository");
class PostsModule {
    constructor() {
        const db = new configDB_1.default();
        const logger = new winston_1.default();
        const repository = new posts_repository_1.PostsRepository(db, logger);
        const cloudinaryService = new cloudinary_service_1.CloudinaryService(logger);
        const feedRepository = new feed_repository_1.FeedRepository();
        const recRepository = new recommendations_repository_1.RecommendationsRepository();
        const profilesRepository = new profiles_repository_1.ProfilesRepository(db, logger);
        const feedService = new feed_services_1.FeedService(feedRepository, recRepository, profilesRepository);
        const service = new posts_services_1.PostsServices(repository, feedRepository, redis_1.default, cloudinaryService, logger, feedService);
        // Warmup du cache au démarrage (non-bloquant)
        service.warmupGuestFeed();
        const controller = new posts_controller_1.PostsController(service, logger);
        const routerInstance = new posts_routes_1.PostsRouter(controller);
        this.router = routerInstance.getRouter();
    }
    getRouter() {
        return this.router;
    }
}
exports.PostsModule = PostsModule;
//# sourceMappingURL=posts.module.js.map