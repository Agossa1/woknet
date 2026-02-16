"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = connectRedis;
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});
redisClient.on("error", (err) => { console.error("Redis Client Error", err); });
async function connectRedis() {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log("Connected to Redis successfully");
        }
    }
    catch (error) {
    }
}
exports.default = redisClient;
//# sourceMappingURL=redis.js.map