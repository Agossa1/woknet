"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
class CorsConfiguration {
    constructor() {
        /**
         * Méthode de validation de l'origine
         */
        this.checkOrigin = (origin, callback) => {
            // En mode développement, on peut autoriser les requêtes sans origine (comme Postman)
            if (!origin || this.allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Accès refusé par la politique CORS de WorkNet'));
            }
        };
        // Tu peux aussi passer ceci en paramètre du constructeur
        this.allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            ' http://192.168.100.10:3000'
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
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
            // Certains navigateurs (comme Safari) ont besoin de ceci pour les cookies
            exposedHeaders: ['set-cookie'],
        };
    }
}
// Export d'une instance unique (Singleton pattern)
exports.corsOptions = new CorsConfiguration().getOptions();
//# sourceMappingURL=cors.js.map