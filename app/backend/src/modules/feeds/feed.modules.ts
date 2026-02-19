import { Router } from 'express';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.services';
import { FeedRepository } from './feed.repository';
import { RecommendationsRepository } from '../recommendations/recommendations.repository';
import { AuthGuard } from "../../infra/middleware/auth.middleware";
import { ProfilesRepository } from "../profiles/profiles.repository";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";


/**
 * Ce fichier sert de "Container" pour l'injection de dépendances
 * Il assemble les Repositories -> Service -> Controller
 */
export class FeedModule {
  private static instance: FeedModule;
  private router: Router;

  private constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  // Singleton pour s'assurer qu'on n'instancie pas le module plusieurs fois
  public static getInstance(): FeedModule {
    if (!FeedModule.instance) {
      FeedModule.instance = new FeedModule();
    }
    return FeedModule.instance;
  }

  private setupRoutes(): void {
    // 1. Instanciation des dépendances (Repositories)
    const feedRepository = new FeedRepository();
    const db = new PostgresDatabase();
    const logger = new Logger();
    const recommendationsRepository = new RecommendationsRepository();
    const profilesRepository = new ProfilesRepository(db as any, logger);

    // 2. Injection dans le Service (Logique métier)
    const feedService = new FeedService(feedRepository, recommendationsRepository, profilesRepository);

    // 3. Injection dans le Controller (Interface Web)
    const feedController = new FeedController(feedService);

    // 4. Définition des endpoints
    // GET /api/feed?page=1
    this.router.get(
      '/', 
      AuthGuard.authenticate, 
      (req, res) => feedController.handle(req, res)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}