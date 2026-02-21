"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
class CorsConfiguration {
    constructor() {
        /**
         * Méthode de validation de l'origine
         */
        this.checkOrigin = (origin, callback) => {
            if (!origin || this.allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Accès refusé par la politique CORS de Bernard'));
            }
        };
        // Tu peux aussi passer ceci en paramètre du constructeur
        this.allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
        ];
    }
    /**
     * Génère l'objet de configuration final pour Express
     */
    getOptions() {
        return {
            origin: this.checkOrigin,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        };
    }
}
// Export d'une instance unique (Singleton pattern)
exports.corsOptions = new CorsConfiguration().getOptions();
//# sourceMappingURL=cors.js.map