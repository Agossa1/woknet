"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const winston_1 = __importDefault(require("./infra/logger/winston"));
const morgan_1 = __importDefault(require("./infra/logger/morgan"));
const express_2 = __importDefault(require("./infra/index/express"));
const configDB_1 = __importDefault(require("./config/databases/configDB"));
const middleware_error_1 = require("./errors/middleware.error");
const redis_1 = require("./config/redis/redis");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const logger = new winston_1.default();
const errorHandler = new middleware_error_1.ErrorHandler(logger.instance);
app.use((0, cors_1.default)());
// Middleware initialization
new express_2.default(app).apply();
new morgan_1.default(app, logger).apply();
async function startServer() {
    // Try to connect to Redis if the module exists; otherwise continue without Redis
    await (0, redis_1.connectRedis)();
    const database = new configDB_1.default();
    await database.connect();
    // Routes initialization
    app.use('/api', routes_1.default);
    // GLOBAL ERROR HANDLER (must be after routes)
    app.use(errorHandler.handle);
    logger.instance.info("Application demarrée avec succès");
}
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map