import { Application } from "express";
import Logger from "./winston";
import morgan from "morgan";


/**
 * Classe MorganMiddleware
 * Responsabilité : connecter Morgan (HTTP logs) à Winston
 */
export default class MorganMiddleware {
    constructor(
        private readonly app: Application,
        private readonly logger: Logger,
        private readonly format: string = process.env.NODE_ENV === "production" ? "combined" : "dev"
    ) { }

    /**
     * Applique le middleware Morgan à l'application Express
     */
    public apply(): void {
        this.app.use(morgan(this.format, {
            stream: this.logger.stream
        })
        )
    }
}