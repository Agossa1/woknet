import { Router } from "express";
import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import { ErrorHandler } from "../../errors/middleware.error";
import { AuthRepository } from "./auth.repository";
import redisClient from "../../config/redis/redis";
import { AuthServices } from "./auth.services";
import { YumiMailService } from "../../utils/email/email.services";
import NodemailerProvider from "../../utils/email/mail.provider";
import { PasswordService } from "../../infra/services/passwords/passwordServices";
import { TokenManager } from "../../config/tokens/token-manager";
import { EmailLogRepository } from "../../utils/email/mail.repository";
import RedisClient from "@redis/client/dist/lib/client";
import { AuthController } from "./auth.controller";
import { AuthRouter } from "./auth.routes";



export class AuthModule {
    private readonly router: Router;
    constructor() {
        const db = new PostgresDatabase();
        const logger = new Logger();
        const errorHandler = new ErrorHandler(logger.instance);
        const authRepository = new AuthRepository(db as any, logger, redisClient as any);
        const mailProvider = new NodemailerProvider();
        const mailRepository = new EmailLogRepository(db, logger);
        const mailServices = new YumiMailService(mailProvider, mailRepository, logger);
        const tokenManager = new TokenManager();
        const password = new PasswordService();

        // 2. Initialisation du Service Métier
        const authService = new AuthServices(
            authRepository,
            redisClient as any,
            tokenManager,
            logger,
            password,
            mailServices
        );

        // 3. Initialisation du Contrôleur
        const authController = new AuthController(
            authService,
            logger
        );

        // 4. Initialisation du Router (On passe l'instance du controller, sans parenthèses)
        // Note: Vérifie que ta classe AuthRouter accepte bien authController dans son constructor
        const authRouterInstance = new AuthRouter(authController);
        this.router = authRouterInstance.getRouter();
    }

    public getRouter(): Router {
        return this.router;
    }
}