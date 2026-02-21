"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const middleware_error_1 = require("../../errors/middleware.error");
const auth_repository_1 = require("./auth.repository");
const redis_1 = __importDefault(require("../../config/redis/redis"));
const auth_services_1 = require("./auth.services");
const email_services_1 = require("../../utils/email/email.services");
const mail_provider_1 = __importDefault(require("../../utils/email/mail.provider"));
const passwordServices_1 = require("../../infra/services/passwords/passwordServices");
const token_manager_1 = require("../../config/tokens/token-manager");
const mail_repository_1 = require("../../utils/email/mail.repository");
const auth_controller_1 = require("./auth.controller");
const auth_routes_1 = require("./auth.routes");
class AuthModule {
    constructor() {
        const db = new configDB_1.default();
        const logger = new winston_1.default();
        const errorHandler = new middleware_error_1.ErrorHandler(logger.instance);
        const authRepository = new auth_repository_1.AuthRepository(db, logger, redis_1.default);
        const mailProvider = new mail_provider_1.default();
        const mailRepository = new mail_repository_1.EmailLogRepository(db, logger);
        const mailServices = new email_services_1.YumiMailService(mailProvider, mailRepository, logger);
        const tokenManager = new token_manager_1.TokenManager();
        const password = new passwordServices_1.PasswordService();
        // 2. Initialisation du Service Métier
        const authService = new auth_services_1.AuthServices(authRepository, redis_1.default, tokenManager, logger, password, mailServices);
        // 3. Initialisation du Contrôleur
        const authController = new auth_controller_1.AuthController(authService, logger);
        // 4. Initialisation du Router (On passe l'instance du controller, sans parenthèses)
        // Note: Vérifie que ta classe AuthRouter accepte bien authController dans son constructor
        const authRouterInstance = new auth_routes_1.AuthRouter(authController);
        this.router = authRouterInstance.getRouter();
    }
    getRouter() {
        return this.router;
    }
}
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.modules.js.map