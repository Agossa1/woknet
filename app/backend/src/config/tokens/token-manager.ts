import jwt from 'jsonwebtoken';
import { InternalServerError, AppError } from '../../errors/custom-errors';
import { randomUUID } from "node:crypto";
import Redis from "ioredis";

export interface TokenPayload {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    role: string;
}

// Exception spécifique pour les tokens
export class InvalidTokenException extends AppError {
    constructor(message: string = "Token invalide ou expiré") {
        super(message, 401);
    }
}

export class TokenManager {
    private readonly accessTokenSecret: string;
    private readonly accessTokenExpiration: string;
    private readonly refreshTokenSecret: string;
    private readonly refreshTokenExpiration: string;
    private readonly redis: Redis;

    constructor() {
        // Validation stricte des variables d'environnement au démarrage
        this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "";
        this.accessTokenExpiration = process.env.ACCESS_TOKEN_EXPIRATION || "15m";
        this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "";
        this.refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION || "7d";
        this.redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

        if (!this.accessTokenSecret || !this.refreshTokenSecret) {
            throw new Error("CRITICAL: JWT Secrets are not defined in environment variables");
        }
    }

    /**
     * Génère un Access Token (Court terme)
     */
    generateAccessToken(user: TokenPayload): string {
        try {
            const payload = {
                sub: user.id, // Utilisation du standard 'sub' pour l'ID
                role: user.role,
                jti: randomUUID()  
            };

            return jwt.sign(payload, this.accessTokenSecret, {
                expiresIn: this.accessTokenExpiration as any
            });
        } catch (error) {
            throw new InternalServerError("Erreur lors de la génération de l'access token");
        }
    }

    /**
     * Génère un Refresh Token (Long terme)
     */
    generateRefreshToken(user: TokenPayload): string {
        try {
            const payload = { sub: user.id, role: user.role , jti: randomUUID()};

            return jwt.sign(payload, this.refreshTokenSecret, {
                expiresIn: this.refreshTokenExpiration as any
            });
        } catch (error) {
            throw new InternalServerError("Erreur lors de la génération du refresh token");
        }
    }

    /**
     * Vérifie la validité d'un Access Token
     */
    verifyAccessToken(token: string): any {
        try {
            return jwt.verify(token, this.accessTokenSecret);
        } catch (error) {
            throw new InvalidTokenException();
        }
    }

    /**
     * Vérifie la validité d'un Refresh Token
     */
    verifyRefreshToken(token: string): any {
        try {
            return jwt.verify(token, this.refreshTokenSecret);
        } catch (error) {
            throw new InvalidTokenException("Refresh token invalide ou expiré");
        }
    }

    /**
     * Révoque un token (Logout)
     */
    async revokeToken(token: string): Promise<void> {
        try {
            const decoded: any = jwt.decode(token);
            if (!decoded || !decoded.jti || !decoded.exp) return;

            const timeLeft = decoded.exp - Math.floor(Date.now() / 1000);
            if (timeLeft > 0) {
                // On stocke le JTI dans Redis avec une expiration automatique
                await this.redis.set(`blacklist:${decoded.jti}`, "1", "EX", timeLeft);
            }
        } catch (error) {
            // Silence si le token est illisible
        }
    }

    /**
     * Vérifie si un token est dans la liste noire
     */
    async isTokenRevoked(token: string): Promise<boolean> {
        try {
            const decoded: any = jwt.decode(token);
            if (!decoded || !decoded.jti) return true;

            const blacklisted = await this.redis.get(`blacklist:${decoded.jti}`);
            return blacklisted !== null;
        } catch {
            return true;
        }
    }
 
    decode(token: string): any {
        try {
            return jwt.decode(token);
        } catch (error) {
            return null;
        }
    }

        
}