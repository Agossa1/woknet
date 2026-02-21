"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationsService = void 0;
const recommendations_repository_1 = require("./recommendations.repository");
const winston_1 = __importDefault(require("../../infra/logger/winston"));
class RecommendationsService {
    constructor() {
        this.repo = new recommendations_repository_1.RecommendationsRepository();
        this.logger = new winston_1.default();
    }
    async trackSignal(dto) {
        try {
            await this.repo.saveSignal(dto);
            // Optional: Trigger real-time re-ranking if high impact signal?
            // if (dto.weight && dto.weight > 5) { ... }
        }
        catch (error) {
            this.logger.instance.error(`[Recs] Failed to track signal: ${error}`);
            // Non-blocking error: we don't want to crash the user experience for analytics
        }
    }
    async getProfileRecommendations(userId, limit = 10) {
        try {
            return await this.repo.getProfileRecommendations(userId, limit);
        }
        catch (error) {
            this.logger.instance.error(`[Recs] Failed to get profile recommendations: ${error}`);
            return [];
        }
    }
    async getJobRecommendations(userId, limit = 10) {
        try {
            return await this.repo.getJobRecommendations(userId, limit);
        }
        catch (error) {
            this.logger.instance.error(`[Recs] Failed to get job recommendations: ${error}`);
            return [];
        }
    }
}
exports.RecommendationsService = RecommendationsService;
//# sourceMappingURL=recommendations.service.js.map