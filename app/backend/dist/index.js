"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cors_2 = require("./config/cors");
const winston_1 = __importDefault(require("./infra/logger/winston"));
const morgan_1 = __importDefault(require("./infra/logger/morgan"));
const express_2 = __importDefault(require("./infra/index/express"));
const configDB_1 = __importDefault(require("./config/databases/configDB"));
const middleware_error_1 = require("./errors/middleware.error");
const redis_1 = require("./config/redis/redis");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const logger = new winston_1.default();
// --- 1. CONFIGURATION RÉSEAU ---
// Indispensable pour récupérer la vraie IP client  sur Render, Heroku, AWS, etc.
app.set('trust proxy', 1);
// --- 2. MIDDLEWARES DE BASE ---
app.use((0, cors_1.default)(cors_2.corsOptions));
new express_2.default(app).apply();
new morgan_1.default(app, logger).apply();
// --- 3. SÉCURITÉ (RATE LIMITING) ---
async function startServer() {
    try {
        const errorHandler = new middleware_error_1.ErrorHandler(logger.instance);
        // --- 4. BASES DE DONNÉES ---
        await (0, redis_1.connectRedis)();
        const database = new configDB_1.default();
        await database.connect();
        // app.use('/api', apiLimit);
        // --- 5. ROUTES ---
        app.use('/api', routes_1.default);
        // --- 6. GESTION DES ERREURS (Toujours en dernier) ---
        app.use(errorHandler.handle);
        logger.instance.info("🚀 Application démarrée avec succès sur le port 3000");
    }
    catch (error) {
        logger.instance.error("❌ Échec du démarrage du serveur :", error);
        process.exit(1);
    }
}
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map