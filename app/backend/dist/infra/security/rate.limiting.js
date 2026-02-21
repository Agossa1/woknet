"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const redis_1 = __importDefault(require("../../config/redis/redis"));
const apiLimit = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: {
        status: 429,
        message: "Trop de requêtes, veuillez réessayer dans 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: new rate_limit_redis_1.default({
        // On utilise une fonction fléchée pour s'assurer que redisClient 
        // est utilisé seulement au moment de l'appel de la requête
        sendCommand: async (...args) => {
            if (!redis_1.default.isOpen) {
                await redis_1.default.connect();
            }
            return redis_1.default.sendCommand(args);
        },
    }),
});
exports.default = apiLimit;
//# sourceMappingURL=rate.limiting.js.map