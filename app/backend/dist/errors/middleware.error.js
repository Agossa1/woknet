"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const custom_errors_1 = require("./custom-errors");
class ErrorHandler {
    constructor(logger) {
        this.logger = logger;
        this.handle = (err, req, res, next // Toujours garder next même si inutilisé pour la signature Express
        ) => {
            let statusCode = 500;
            let message = "Une erreur inattendue est survenue";
            if (err instanceof custom_errors_1.AppError) {
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
        };
    }
    logError(err, statusCode, req) {
        const logMessage = `[${statusCode}] ${req.method} ${req.path} - ${err.message}`;
        if (statusCode >= 500) {
            // On log la stack uniquement pour les erreurs critiques (500)
            this.logger.error(`${logMessage} | Stack: ${err.stack}`);
        }
        else {
            this.logger.warn(logMessage);
        }
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=middleware.error.js.map