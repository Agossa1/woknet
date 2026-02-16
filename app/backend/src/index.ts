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


const app: Application = express();
const logger = new Logger();
const errorHandler = new ErrorHandler(logger.instance);

app.use(cors(corsOptions))

// Middleware initialization
new ConfigureMiddleware(app).apply();
new MorganMiddleware(app, logger).apply();

async function startServer() {
    // Try to connect to Redis if the module exists; otherwise continue without Redis

    await connectRedis();
    const database = new PostgresDatabase();
    await database.connect();

    // Routes initialization
    app.use('/api', router)


    // GLOBAL ERROR HANDLER (must be after routes)
    app.use(errorHandler.handle);

    logger.instance.info("Application demarrée avec succès");
}

startServer();

export default app;