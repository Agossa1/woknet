"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feed_controller_1 = require("./feed.controller");
const feed_repository_1 = require("./feed.repository");
const recommendations_repository_1 = require("../recommendations/recommendations.repository");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
const feed_services_1 = require("./feed.services");
const router = (0, express_1.Router)();
/**
 * --- INJECTION DE DÉPENDANCES ---
 * On assemble les couches de bas en haut :
 * Repository -> Service -> Controller
 */
// 1. Les sources de données
const feedRepository = new feed_repository_1.FeedRepository();
const recsRepository = new recommendations_repository_1.RecommendationsRepository();
// 2. La logique métier (qui mélange contenu + recs)
const feedService = new feed_services_1.FeedService(feedRepository, recsRepository);
// 3. L'interface HTTP
const feedController = new feed_controller_1.FeedController(feedService);
/**
 * @route   GET /api/feed
 * @desc    Récupère le Power Feed (Posts + Projets + Jobs + Recs)
 * @access  Privé (Requiert un token JWT)
 */
router.get('/', auth_middleware_1.AuthGuard.authenticate, // Vérifie que l'utilisateur est connecté
(req, res) => feedController.handle(req, res));
/**
 * @route   GET /api/feed/trending
 * @desc    Optionnel : Flux des contenus les plus populaires
 */
// router.get('/trending', authMiddleware, (req, res) => feedController.handleTrending(req, res));
exports.default = router;
//# sourceMappingURL=feed.routes.js.map