import cors from 'cors';

class CorsConfiguration {
    // On définit les origines comme une propriété privée pour l'encapsulation
    private readonly allowedOrigins: string[];

    constructor() {
        // Tu peux aussi passer ceci en paramètre du constructeur
        this.allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            
        ];
    }

    /**
     * Méthode de validation de l'origine
     */
    private checkOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void => {
        if (!origin || this.allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Accès refusé par la politique CORS de Bernard'));
        }
    };

    /**
     * Génère l'objet de configuration final pour Express
     */
    public getOptions(): cors.CorsOptions {
        return {
            origin: this.checkOrigin,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        };
    }
}

// Export d'une instance unique (Singleton pattern)
export const corsOptions = new CorsConfiguration().getOptions();