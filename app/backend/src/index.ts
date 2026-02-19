import express, { Application } from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors';
import Logger from './infra/logger/winston';
import MorganMiddleware from './infra/logger/morgan';
import ConfigureMiddleware from './infra/index/express';
import PostgresDatabase from './config/databases/configDB';
import { ErrorHandler } from './errors/middleware.error';
import { connectRedis } from './config/redis/redis';
import router from './routes';

import apiLimit from './infra/security/rate.limiting';




const app: Application = express();
const logger = new Logger();

// --- 1. CONFIGURATION RÉSEAU ---
// Indispensable pour récupérer la vraie IP client  sur Render, Heroku, AWS, etc.
app.set('trust proxy', 1);

// --- 2. MIDDLEWARES DE BASE ---
app.use(cors(corsOptions));

new ConfigureMiddleware(app).apply();
new MorganMiddleware(app, logger).apply();

// --- 3. SÉCURITÉ (RATE LIMITING) ---



async function startServer() {
    try {
        const errorHandler = new ErrorHandler(logger.instance);

        // --- 4. BASES DE DONNÉES ---
        await connectRedis();
        const database = new PostgresDatabase();
        await database.connect();


       // app.use('/api', apiLimit);
        // --- 5. ROUTES ---
        app.use('/api', router);


        // --- 6. GESTION DES ERREURS (Toujours en dernier) ---
        app.use(errorHandler.handle);

        logger.instance.info("🚀 Application démarrée avec succès sur le port 3000");
    } catch (error) {
        logger.instance.error("❌ Échec du démarrage du serveur :", error);
        process.exit(1);
    }
}

startServer();

export default app;
