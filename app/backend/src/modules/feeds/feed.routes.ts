import { Router } from 'express';
import { FeedController } from './feed.controller';
import { FeedRepository } from './feed.repository';
import { RecommendationsRepository } from '../recommendations/recommendations.repository';
import { AuthGuard } from '../../infra/middleware/auth.middleware';
import { FeedService } from './feed.services';

const router = Router();

/**
 * --- INJECTION DE DÉPENDANCES --- 
 * On assemble les couches de bas en haut :
 * Repository -> Service -> Controller
 */

// 1. Les sources de données
const feedRepository = new FeedRepository();
const recsRepository = new RecommendationsRepository();

// 2. La logique métier (qui mélange contenu + recs)
const feedService = new FeedService(feedRepository, recsRepository);

// 3. L'interface HTTP
const feedController = new FeedController(feedService);

/**
 * @route   GET /api/feed
 * @desc    Récupère le Power Feed (Posts + Projets + Jobs + Recs)
 * @access  Privé (Requiert un token JWT)
 */
router.get(
    '/',
    AuthGuard.authenticate, // Vérifie que l'utilisateur est connecté
    (req, res) => feedController.handle(req, res)
);

/**
 * @route   GET /api/feed/trending
 * @desc    Optionnel : Flux des contenus les plus populaires
 */
// router.get('/trending', authMiddleware, (req, res) => feedController.handleTrending(req, res));

export default router;