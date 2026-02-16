import winston, { stream } from "winston"

/**
 * Class logger
 * Responsabilté: créer et configurér un logger winston
 */

export default class Logger {
    //Instance interne de winston (privée)

    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            //Niveau de log (info, error, warn, debug ... )

            level: process.env.LOG_LEVEL || "info",

            // Format global des logs

            format: winston.format.combine(
                winston.format.timestamp({
                    format: "YYYY-MM-DD HH:mm:ss"
                }),
                winston.format.errors({ stack: true }),
                winston.format.splat(),
                winston.format.json()
            ),

            // Métadonnée par defaut

            defaultMeta: {
                service: "api"
            },

            // Transports = où les logs sont envoyés

            transports: []
        });


        // Ajout du transport copnsole en environnement non production 

        if (process.env.NODE_ENV !== "production") {
            this.logger.add(
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.printf(info => {
                            return `${info.timestamp} ${info.level}: ${info.message}`
                        })
                    )
                })
            )
        }
    }
    /**
 * Accès public au logger Winston
 * Permet aux autres parties de l'application
 * d'utiliser le logger sans exposer son implémentation interne
 */
    public get instance(): winston.Logger {
        return this.logger;
    }

    /**
     * Stream utilisé par Morgan (HTTP logger)
     * Morgan attend un objet avec une fonction `write(message)`
     */
    public stream = {
        write: (message: string): void => {
            this.logger.info(message.trim());
        }
    };

}


