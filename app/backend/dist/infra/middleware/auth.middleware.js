"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const winston_1 = __importDefault(require("../logger/winston"));
const token_manager_1 = require("../../config/tokens/token-manager");
/**
 * GUARD DE SÉCURITÉ : Vérifie si un objet est un utilisateur valide.
 */
function isUser(decoded) {
    return (typeof decoded === 'object' &&
        decoded !== null &&
        'id' in decoded &&
        'role' in decoded);
}
/**
 * CLASSE D'AUTHENTIFICATION (POO)
 * Implémente une logique de défense en profondeur.
 */
class AuthGuard {
    /**
     * Middleware principal d'authentification.
     */
    static authenticate(req, res, next) {
        try {
            const token = AuthGuard.extractToken(req);
            if (!token) {
                // On ne donne pas de détails sur l'absence (sécurité par l'obscurité relative)
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const decoded = AuthGuard.tokenManages.verifyAccessToken(token);
            // Mapping JWT standard (sub -> id)
            if (decoded.sub && !decoded.id) {
                decoded.id = decoded.sub;
            }
            if (!isUser(decoded)) {
                throw new Error('Invalid token structure');
            }
            // Attachement sécurisé (objet gelé pour empêcher toute modification ultérieure)
            req.user = Object.freeze(decoded);
            next();
        }
        catch (error) {
            AuthGuard.logger.instance.error(`Auth failure: ${error instanceof Error ? error.message : 'Unknown error'}`);
            res.status(401).json({ error: 'Access denied: invalid or expired session' });
        }
    }
    /**
     * Middleware d'authentification OPTIONNEL.
     * Si un token est présent, il est vérifié et l'utilisateur est attaché.
     * Sinon, on continue sans erreur (req.user restera undefined).
     */
    static optionalAuthenticate(req, res, next) {
        try {
            const token = AuthGuard.extractToken(req);
            if (!token)
                return next();
            const decoded = AuthGuard.tokenManages.verifyAccessToken(token);
            if (decoded.sub && !decoded.id)
                decoded.id = decoded.sub;
            if (isUser(decoded)) {
                req.user = Object.freeze(decoded);
            }
            next();
        }
        catch (error) {
            // En cas d'erreur sur un token optionnel, on continue quand même sans utilisateur
            next();
        }
    }
    /**
     * Usine à middlewares pour la vérification des rôles.
     * Supporte un rôle unique ou une liste de rôles.
     * Gère la hiérarchie (SUPERADMIN > ADMIN) et les rôles multiples (array).
     */
    static authorizeRole(allowedRoles) {
        const requiredRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        const normalizedRequired = requiredRoles.map(r => r.toUpperCase());
        return (req, res, next) => {
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const rawRole = req.user.role;
            // Normalisation : On s'assure d'avoir un tableau de rôles en majuscules
            const rawRoles = Array.isArray(rawRole) ? rawRole : [rawRole];
            const userRoles = rawRoles.map(r => String(r).toUpperCase());
            // Un utilisateur est autorisé s'il possède au moins un des rôles requis
            // ou s'il est SUPERADMIN (Hiérarchie)
            const isAuthorized = userRoles.some(role => normalizedRequired.includes(role) || role === 'SUPERADMIN');
            if (!isAuthorized) {
                AuthGuard.logger.instance.warn(`Insufficient permissions: User ${req.user.id} has roles [${userRoles.join(',')}] but needs one of [${normalizedRequired.join(',')}]`);
                res.status(403).json({
                    error: 'Insufficient permissions',
                    message: `Required one of: ${normalizedRequired.join(', ')}`,
                    yourRoles: userRoles
                });
                return;
            }
            next();
        };
    }
    /**
     * Extraction sécurisée du token (Private helper)
     * Protège contre les attaques par injection dans les headers et cookies.
     */
    static extractToken(req) {
        // 1. Vérification Header Authorization (Prioritaire)
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const match = authHeader.match(this.BEARER_REGEX);
            if (match)
                return match[1];
        }
        // 2. Vérification Cookie via cookie-parser (Recommandé)
        if (req.cookies?.access_token) {
            return req.cookies.access_token;
        }
        // 3. Fallback parsing manuel (Si cookie-parser n'a pas encore agi)
        const rawCookie = req.headers.cookie;
        if (rawCookie) {
            const keys = rawCookie.split(';').map(c => c.split('=')[0].trim());
            AuthGuard.logger.instance.debug(`[AuthGuard] Raw cookie keys: ${keys.join(', ')}`);
            return AuthGuard.parseCookie(rawCookie, 'access_token');
        }
        return null;
    }
    /**
     * Parsing manuel robuste sans dépendance externe.
     * Nettoyage strict des entrées pour éviter le Cookie Poisoning.
     */
    static parseCookie(cookieString, key) {
        const cookies = cookieString.split(';');
        for (let cookie of cookies) {
            const [cookieKey, ...cookieValueParts] = cookie.trim().split('=');
            if (cookieKey === key) {
                const value = cookieValueParts.join('=');
                // Validation basique du format JWT pour le cookie
                if (/^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/.test(value)) {
                    return value;
                }
            }
        }
        return null;
    }
}
exports.AuthGuard = AuthGuard;
AuthGuard.BEARER_REGEX = /^Bearer\s([a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+)$/;
AuthGuard.logger = new winston_1.default();
AuthGuard.tokenManages = new token_manager_1.TokenManager();
//# sourceMappingURL=auth.middleware.js.map