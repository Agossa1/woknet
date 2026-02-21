"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRecommendationsServices = void 0;
const user_recommendations_types_1 = require("./user-recommendations.types");
const custom_errors_1 = require("../../errors/custom-errors");
class UserRecommendationsServices {
    constructor(repository, logger) {
        this.repository = repository;
        this.logger = logger;
    }
    async giveRecommendation(giverId, receiverId, content, relationship) {
        this.logger.instance.info(`User ${giverId} giving recommendation to ${receiverId}`);
        return await this.repository.createRecommendation(giverId, receiverId, content, relationship);
    }
    async getProfileRecommendations(profileId) {
        return await this.repository.getReceivedRecommendations(profileId);
    }
    async getSentRecommendations(profileId) {
        return await this.repository.getSentRecommendations(profileId);
    }
    async getPendingRecommendations(profileId) {
        return await this.repository.getPendingRecommendations(profileId);
    }
    async approveRecommendation(recommendationId, receiverId) {
        const recommendation = await this.repository.findById(recommendationId);
        if (!recommendation)
            throw new custom_errors_1.NotFoundError("Recommendation not found");
        if (recommendation.receiver_id !== receiverId)
            throw new custom_errors_1.UnauthorizedError("Not authorized to approve this recommendation");
        await this.repository.updateStatus(recommendationId, user_recommendations_types_1.RecommendationStatus.APPROVED);
    }
    async rejectRecommendation(recommendationId, receiverId) {
        const recommendation = await this.repository.findById(recommendationId);
        if (!recommendation)
            throw new custom_errors_1.NotFoundError("Recommendation not found");
        if (recommendation.receiver_id !== receiverId)
            throw new custom_errors_1.UnauthorizedError("Not authorized to reject this recommendation");
        await this.repository.updateStatus(recommendationId, user_recommendations_types_1.RecommendationStatus.REJECTED);
    }
    async deleteRecommendation(recommendationId, profileId) {
        await this.repository.deleteRecommendation(recommendationId, profileId);
    }
}
exports.UserRecommendationsServices = UserRecommendationsServices;
//# sourceMappingURL=user-recommendations.services.js.map