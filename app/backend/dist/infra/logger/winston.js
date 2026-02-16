"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
/**
 * Class logger
 * Responsabilté: créer et configurér un logger winston
 */
class Logger {
    constructor() {
        /**
         * Stream utilisé par Morgan (HTTP logger)
         * Morgan attend un objet avec une fonction `write(message)`
         */
        this.stream = {
            write: (message) => {
                this.logger.info(message.trim());
            }
        };
        this.logger = winston_1.default.createLogger({
            //Niveau de log (info, error, warn, debug ... )
            level: process.env.LOG_LEVEL || "info",
            // Format global des logs
            format: winston_1.default.format.combine(winston_1.default.format.timestamp({
                format: "YYYY-MM-DD HH:mm:ss"
            }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json()),
            // Métadonnée par defaut
            defaultMeta: {
                service: "api"
            },
            // Transports = où les logs sont envoyés
            transports: []
        });
        // Ajout du transport copnsole en environnement non production 
        if (process.env.NODE_ENV !== "production") {
            this.logger.add(new winston_1.default.transports.Console({
                format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(info => {
                    return `${info.timestamp} ${info.level}: ${info.message}`;
                }))
            }));
        }
    }
    /**
 * Accès public au logger Winston
 * Permet aux autres parties de l'application
 * d'utiliser le logger sans exposer son implémentation interne
 */
    get instance() {
        return this.logger;
    }
}
exports.default = Logger;
//# sourceMappingURL=winston.js.map