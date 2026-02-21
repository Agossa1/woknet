"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningsMiddleware = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const redis_1 = __importDefault(require("../../config/redis/redis"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const auth_repository_1 = require("../auth/auth.repository");
class LearningsMiddleware {
    constructor() {
        this.isInstructor = async (req, res, next) => {
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            try {
                const user = await this.authRepository.findById(req.user.id);
                if (!user || !user.is_verified) {
                    this.logger.instance.warn(`User ${req.user.id} is not an instructor.`);
                    res.status(403).json({ error: 'Forbidden: You must be an instructor to access this resource.' });
                    return;
                }
                next();
            }
            catch (error) {
                this.logger.instance.error('Error in isInstructor middleware:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        };
        const db = new configDB_1.default();
        this.logger = new winston_1.default();
        this.authRepository = new auth_repository_1.AuthRepository(db, this.logger, redis_1.default);
    }
}
exports.LearningsMiddleware = LearningsMiddleware;
//# sourceMappingURL=learnings.middleware.js.map