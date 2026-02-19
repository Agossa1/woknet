import rateLimit from 'express-rate-limit';
import RedisStore, { RedisReply } from 'rate-limit-redis';
import redisClient from '../../config/redis/redis';

const apiLimit = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: {
        status: 429,
        message: "Trop de requêtes, veuillez réessayer dans 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        // On utilise une fonction fléchée pour s'assurer que redisClient 
        // est utilisé seulement au moment de l'appel de la requête
        sendCommand: async (...args: string[]) => {
            if (!redisClient.isOpen) {
                await redisClient.connect();
            }
            return redisClient.sendCommand(args) as Promise<RedisReply>;
        },
    }),
});

export default apiLimit;