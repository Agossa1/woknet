import { Request, Response, NextFunction } from "express";
import { AppError } from "./custom-errors";

interface ILogger {
    error(message: string): void;
    warn(message: string): void;
}

export class ErrorHandler {
    constructor(private readonly logger: ILogger) { }

    public handle = (
        err: any, // On utilise any pour capturer les objets d'erreurs tiers (Redis, DB, etc.)
        req: Request,
        res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next: NextFunction
    ): void => {
        // 1. Valeurs par défaut (Sécurité maximale)
        let statusCode = err.statusCode || 500;
        let message = "Une erreur interne est survenue sur nos serveurs.";
        let status = 'error';

        // 2. Log de l'erreur REELLE en interne (avant transformation pour le client)
        this.logError(err, statusCode, req);

        // 3. Filtrage du message pour le client
        if (err instanceof AppError) {
            // Si c'est une erreur opérationnelle (4xx, 404, etc.), on montre le message
            if (err.isOperational) {
                message = err.message;
                status = statusCode >= 500 ? 'error' : 'fail';
            }
        }
        // Gestion des erreurs de librairies tierces connues (Multer, Redis, JWT)
        else if (err.message === 'File too large' || err.code === 'LIMIT_FILE_SIZE') {
            statusCode = 413;
            message = "Le fichier est trop volumineux. La taille maximum autorisée est de 50Mo.";
            status = 'fail';
        }
        else if (err.name === 'JsonWebTokenError') {
            statusCode = 401;
            message = "Jeton d'authentification invalide.";
            status = 'fail';
        }

        // 4. Construction de la réponse JSON
        const response = {
            status: status,
            message: message,
            // On ajoute les détails techniques UNIQUEMENT en mode développement
            ...(process.env.NODE_ENV === 'development' && {
                rawError: err.message,
                stack: err.stack,
                details: err
            })
        };

        res.status(statusCode).json(response);
    }

    private logError(err: Error, statusCode: number, req: Request) {
        const logMessage = `[${statusCode}] ${req.method} ${req.path} - ${err.message}`;

        if (statusCode >= 500) {
            // Pour les 500, on veut le maximum de détails dans nos fichiers de logs
            this.logger.error(`${logMessage} | Stack: ${err.stack}`);
        } else {
            // Pour les 4xx, un simple avertissement suffit
            this.logger.warn(logMessage);
        }
    }
}