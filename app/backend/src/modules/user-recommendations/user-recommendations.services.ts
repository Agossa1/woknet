import { UserRecommendationsRepository } from "./user-recommendations.repository";
import { RecommendationStatus, UserRecommendation } from "./user-recommendations.types";
import { NotFoundError, UnauthorizedError } from "../../errors/custom-errors";
import Logger from "../../infra/logger/winston";

export class UserRecommendationsServices {
    constructor(
        private readonly repository: UserRecommendationsRepository,
        private readonly logger: Logger
    ) { }

    async giveRecommendation(giverId: string, receiverId: string, content: string, relationship?: string): Promise<UserRecommendation> {
        this.logger.instance.info(`User ${giverId} giving recommendation to ${receiverId}`);
        return await this.repository.createRecommendation(giverId, receiverId, content, relationship);
    }

    async getProfileRecommendations(profileId: string): Promise<UserRecommendation[]> {
        return await this.repository.getReceivedRecommendations(profileId);
    }

    async getSentRecommendations(profileId: string): Promise<UserRecommendation[]> {
        return await this.repository.getSentRecommendations(profileId);
    }

    async getPendingRecommendations(profileId: string): Promise<UserRecommendation[]> {
        return await this.repository.getPendingRecommendations(profileId);
    }

    async approveRecommendation(recommendationId: string, receiverId: string): Promise<void> {
        const recommendation = await this.repository.findById(recommendationId);
        if (!recommendation) throw new NotFoundError("Recommendation not found");
        if (recommendation.receiver_id !== receiverId) throw new UnauthorizedError("Not authorized to approve this recommendation");

        await this.repository.updateStatus(recommendationId, RecommendationStatus.APPROVED);
    }

    async rejectRecommendation(recommendationId: string, receiverId: string): Promise<void> {
        const recommendation = await this.repository.findById(recommendationId);
        if (!recommendation) throw new NotFoundError("Recommendation not found");
        if (recommendation.receiver_id !== receiverId) throw new UnauthorizedError("Not authorized to reject this recommendation");

        await this.repository.updateStatus(recommendationId, RecommendationStatus.REJECTED);
    }

    async deleteRecommendation(recommendationId: string, profileId: string): Promise<void> {
        await this.repository.deleteRecommendation(recommendationId, profileId);
    }
}
