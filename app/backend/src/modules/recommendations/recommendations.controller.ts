import { RecommendationsService } from "./recommendations.service";
import { Request, Response } from "express";
import { SecureRequest } from "../../infra/middleware/auth.middleware";

export class RecommendationsController {
    private service: RecommendationsService;

    constructor() {
        this.service = new RecommendationsService();
    }

    track = async (req: SecureRequest, res: Response) => {
        const { item_id, item_type, action_type, metadata } = req.body;

        // Asynchronous tracking: We respond immediately
        this.service.trackSignal({
            user_id: req.user!.id,
            item_id,
            item_type,
            action_type,
            metadata
        });

        return res.status(202).json({ success: true, message: 'Signal captured' });
    }

    getProfileSuggestions = async (req: SecureRequest, res: Response) => {
        const limit = parseInt(req.query.limit as string) || 10;

        const suggestions = await this.service.getProfileRecommendations(req.user!.id, limit);

        return res.status(200).json(suggestions);
    }
}
