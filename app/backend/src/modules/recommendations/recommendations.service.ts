import { RecommendationsRepository } from "./recommendations.repository";
import { CreateSignalDTO } from "./recommendations.types";
import Logger from "../../infra/logger/winston";

export class RecommendationsService {
    private repo: RecommendationsRepository;
    private logger: Logger;

    constructor() {
        this.repo = new RecommendationsRepository();
        this.logger = new Logger();
    }

    async trackSignal(dto: CreateSignalDTO): Promise<void> {
        try {
            await this.repo.saveSignal(dto);
            // Optional: Trigger real-time re-ranking if high impact signal?
            // if (dto.weight && dto.weight > 5) { ... }
        } catch (error) {
            this.logger.instance.error(`[Recs] Failed to track signal: ${error}`);
            // Non-blocking error: we don't want to crash the user experience for analytics
        }
    }

    async getProfileRecommendations(userId: string, limit: number = 10): Promise<any[]> {
        try {
            return await this.repo.getProfileRecommendations(userId, limit);
        } catch (error) {
            this.logger.instance.error(`[Recs] Failed to get profile recommendations: ${error}`);
            return [];
        }
    }
}
