export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly isOperational = true
  ) {
    super(message);
    this.name.constructor.name

    Error.captureStackTrace(this, this.constructor)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
/**
 * 409 - Conflit (ex: utilisateur déjà existant)
 */
export class ConflictException extends AppError {
  constructor(message: string = "Conflit : La ressource existe déjà") {
    super(message, 409);
  }
}
/**
 * 500 - Erreur interne du serveur
 */
export class InternalServerError extends AppError {
  constructor(message: string = "Erreur interne du serveur") {
    super(message, 500, false); // False car c'est souvent un bug non prévu
  }
}

/**
 * 400 - Requête mal formulée ou données invalides
 */
export class BadRequestException extends AppError {
  constructor(message: string = "Requête invalide") {
    super(message, 400);
  }
}

/**
 * 404 - Ressource non trouvée
 */
export class NotFoundException extends AppError {
  constructor(message: string = "Ressource non trouvée") {
    super(message, 404);
  }
}
export class UnauthorizedException extends AppError {
  constructor(message: string = "Non authentifié") {
    super(message, 401)
  }
}

export class ForbiddenException extends AppError {
  constructor(message: string = "Accès interdit") {
    super(message, 403)
  }
}

/**
 * Erreur spécifique base de données
 */
export class DatabaseQueryError extends AppError {
  constructor(message: string, public readonly originalError?: any) {
    super(
      originalError?.message ? `${message} | Detail: ${originalError.message}` : message,
      500,
      true
    );
    if (originalError) {
      // On garde console.error pour le stack trace complet en dev
      console.error("=== Database Error Detail ===");
      console.error(originalError);
      console.error("=============================");
    }
  }
}

// Aliases pour compatibilité
export const BadRequestError = BadRequestException;
export const NotFoundError = NotFoundException;
export const UnauthorizedError = UnauthorizedException;
export const ForbiddenError = ForbiddenException;
