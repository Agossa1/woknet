import { Request, Response, NextFunction } from "express";
import { AppError } from "./custom-errors";

// On définit une interface pour ne pas dépendre d'une implémentation précise
interface ILogger {
    error(message: string): void;
    warn(message: string): void;
}

export class ErrorHandler {
    constructor(private readonly logger: ILogger) { }

    public handle = (
        err: Error | AppError,
        req: Request,
        res: Response,
        next: NextFunction // Toujours garder next même si inutilisé pour la signature Express
    ): void => {
        let statusCode = 500;
        let message = "Une erreur inattendue est survenue";

        if (err instanceof AppError) {
            statusCode = err.statusCode;
            message = err.message;
        }

        // Gestion spécifique erreur Multer (Fichier trop lourd)
        if (err.message === 'File too large') {
            statusCode = 413;
            message = "Le fichier est trop volumineux. La taille maximum autorisée est de 50Mo.";
        }

        this.logError(err, statusCode, req);

        res.status(statusCode).json({
            status: 'error',
            message,
            // Correction : 'development' et usage de undefined réel
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }

    private logError(err: Error, statusCode: number, req: Request) {
        const logMessage = `[${statusCode}] ${req.method} ${req.path} - ${err.message}`;

        if (statusCode >= 500) {
            // On log la stack uniquement pour les erreurs critiques (500)
            this.logger.error(`${logMessage} | Stack: ${err.stack}`);
        } else {
            this.logger.warn(logMessage);
        }
    }
}