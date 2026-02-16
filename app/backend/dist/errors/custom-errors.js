"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.BadRequestError = exports.DatabaseQueryError = exports.ForbiddenException = exports.UnauthorizedException = exports.NotFoundException = exports.BadRequestException = exports.InternalServerError = exports.ConflictException = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
/**
 * 409 - Conflit (ex: utilisateur déjà existant)
 */
class ConflictException extends AppError {
    constructor(message = "Conflit : La ressource existe déjà") {
        super(message, 409);
    }
}
exports.ConflictException = ConflictException;
/**
 * 500 - Erreur interne du serveur
 */
class InternalServerError extends AppError {
    constructor(message = "Erreur interne du serveur") {
        super(message, 500, false); // False car c'est souvent un bug non prévu
    }
}
exports.InternalServerError = InternalServerError;
/**
 * 400 - Requête mal formulée ou données invalides
 */
class BadRequestException extends AppError {
    constructor(message = "Requête invalide") {
        super(message, 400);
    }
}
exports.BadRequestException = BadRequestException;
/**
 * 404 - Ressource non trouvée
 */
class NotFoundException extends AppError {
    constructor(message = "Ressource non trouvée") {
        super(message, 404);
    }
}
exports.NotFoundException = NotFoundException;
class UnauthorizedException extends AppError {
    constructor(message = "Non authentifié") {
        super(message, 401);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends AppError {
    constructor(message = "Accès interdit") {
        super(message, 403);
    }
}
exports.ForbiddenException = ForbiddenException;
/**
 * Erreur spécifique base de données
 */
class DatabaseQueryError extends AppError {
    constructor(message, originalError) {
        super(originalError?.message ? `${message} | Detail: ${originalError.message}` : message, 500, true);
        this.originalError = originalError;
        if (originalError) {
            // On garde console.error pour le stack trace complet en dev
            console.error("=== Database Error Detail ===");
            console.error(originalError);
            console.error("=============================");
        }
    }
}
exports.DatabaseQueryError = DatabaseQueryError;
// Aliases pour compatibilité
exports.BadRequestError = BadRequestException;
exports.NotFoundError = NotFoundException;
exports.UnauthorizedError = UnauthorizedException;
exports.ForbiddenError = ForbiddenException;
//# sourceMappingURL=custom-errors.js.map