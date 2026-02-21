"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedModule = void 0;
const express_1 = require("express");
const feed_controller_1 = require("./feed.controller");
const feed_services_1 = require("./feed.services");
const feed_repository_1 = require("./feed.repository");
const recommendations_repository_1 = require("../recommendations/recommendations.repository");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
const profiles_repository_1 = require("../profiles/profiles.repository");
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
/**
 * Ce fichier sert de "Container" pour l'injection de dépendances
 * Il assemble les Repositories -> Service -> Controller
 */
class FeedModule {
    constructor() {
        this.router = (0, express_1.Router)();
        this.setupRoutes();
    }
    // Singleton pour s'assurer qu'on n'instancie pas le module plusieurs fois
    static getInstance() {
        if (!FeedModule.instance) {
            FeedModule.instance = new FeedModule();
        }
        return FeedModule.instance;
    }
    setupRoutes() {
        // 1. Instanciation des dépendances (Repositories)
        const feedRepository = new feed_repository_1.FeedRepository();
        const db = new configDB_1.default();
        const logger = new winston_1.default();
        const recommendationsRepository = new recommendations_repository_1.RecommendationsRepository();
        const profilesRepository = new profiles_repository_1.ProfilesRepository(db, logger);
        // 2. Injection dans le Service (Logique métier)
        const feedService = new feed_services_1.FeedService(feedRepository, recommendationsRepository, profilesRepository);
        // 3. Injection dans le Controller (Interface Web)
        const feedController = new feed_controller_1.FeedController(feedService);
        // 4. Définition des endpoints
        // GET /api/feed?page=1
        this.router.get('/', auth_middleware_1.AuthGuard.authenticate, (req, res) => feedController.handle(req, res));
    }
    getRouter() {
        return this.router;
    }
}
exports.FeedModule = FeedModule;
//# sourceMappingURL=feed.modules.js.map