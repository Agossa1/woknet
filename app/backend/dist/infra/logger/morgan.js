"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
/**
 * Classe MorganMiddleware
 * Responsabilité : connecter Morgan (HTTP logs) à Winston
 */
class MorganMiddleware {
    constructor(app, logger, format = process.env.NODE_ENV === "production" ? "combined" : "dev") {
        this.app = app;
        this.logger = logger;
        this.format = format;
    }
    /**
     * Applique le middleware Morgan à l'application Express
     */
    apply() {
        this.app.use((0, morgan_1.default)(this.format, {
            stream: this.logger.stream
        }));
    }
}
exports.default = MorganMiddleware;
//# sourceMappingURL=morgan.js.map