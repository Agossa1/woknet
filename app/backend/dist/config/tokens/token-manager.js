"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenManager = exports.InvalidTokenException = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const custom_errors_1 = require("../../errors/custom-errors");
const node_crypto_1 = require("node:crypto");
const ioredis_1 = __importDefault(require("ioredis"));
// Exception spécifique pour les tokens
class InvalidTokenException extends custom_errors_1.AppError {
    constructor(message = "Token invalide ou expiré") {
        super(message, 401);
    }
}
exports.InvalidTokenException = InvalidTokenException;
class TokenManager {
    constructor() {
        // Validation stricte des variables d'environnement au démarrage
        this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "";
        this.accessTokenExpiration = process.env.ACCESS_TOKEN_EXPIRATION || "15m";
        this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "";
        this.refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION || "7d";
        this.redis = new ioredis_1.default(process.env.REDIS_URL || "redis://localhost:6379");
        if (!this.accessTokenSecret || !this.refreshTokenSecret) {
            throw new Error("CRITICAL: JWT Secrets are not defined in environment variables");
        }
    }
    /**
     * Génère un Access Token (Court terme)
     */
    generateAccessToken(user) {
        try {
            const payload = {
                sub: user.id, // Utilisation du standard 'sub' pour l'ID
                role: user.role,
                jti: (0, node_crypto_1.randomUUID)()
            };
            return jsonwebtoken_1.default.sign(payload, this.accessTokenSecret, {
                expiresIn: this.accessTokenExpiration
            });
        }
        catch (error) {
            throw new custom_errors_1.InternalServerError("Erreur lors de la génération de l'access token");
        }
    }
    /**
     * Génère un Refresh Token (Long terme)
     */
    generateRefreshToken(user) {
        try {
            const payload = { sub: user.id, role: user.role, jti: (0, node_crypto_1.randomUUID)() };
            return jsonwebtoken_1.default.sign(payload, this.refreshTokenSecret, {
                expiresIn: this.refreshTokenExpiration
            });
        }
        catch (error) {
            throw new custom_errors_1.InternalServerError("Erreur lors de la génération du refresh token");
        }
    }
    /**
     * Vérifie la validité d'un Access Token
     */
    verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.accessTokenSecret);
        }
        catch (error) {
            throw new InvalidTokenException();
        }
    }
    /**
     * Vérifie la validité d'un Refresh Token
     */
    verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.refreshTokenSecret);
        }
        catch (error) {
            throw new InvalidTokenException("Refresh token invalide ou expiré");
        }
    }
    /**
     * Révoque un token (Logout)
     */
    async revokeToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            if (!decoded || !decoded.jti || !decoded.exp)
                return;
            const timeLeft = decoded.exp - Math.floor(Date.now() / 1000);
            if (timeLeft > 0) {
                // On stocke le JTI dans Redis avec une expiration automatique
                await this.redis.set(`blacklist:${decoded.jti}`, "1", "EX", timeLeft);
            }
        }
        catch (error) {
            // Silence si le token est illisible
        }
    }
    /**
     * Vérifie si un token est dans la liste noire
     */
    async isTokenRevoked(token) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            if (!decoded || !decoded.jti)
                return true;
            const blacklisted = await this.redis.get(`blacklist:${decoded.jti}`);
            return blacklisted !== null;
        }
        catch {
            return true;
        }
    }
    decode(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch (error) {
            return null;
        }
    }
}
exports.TokenManager = TokenManager;
//# sourceMappingURL=token-manager.js.map