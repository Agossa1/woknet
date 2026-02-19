import { Request, Response } from "express";
import { UserRecommendationsServices } from "./user-recommendations.services";
import { SecureRequest } from "../../infra/middleware/auth.middleware";

export class UserRecommendationsController {
    constructor(private readonly services: UserRecommendationsServices) { }

    async create(req: SecureRequest, res: Response): Promise<void> {
        const giverId = req.user!.id;
        const { receiver_id, content, relationship } = req.body;
        try {
            const result = await this.services.giveRecommendation(giverId, receiver_id, content, relationship);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ error: "Failed to create recommendation" });
        }
    }

    async getReceived(req: Request, res: Response): Promise<void> {
        const profileId = req.params.profileId as string;
        try {
            const result = await this.services.getProfileRecommendations(profileId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch recommendations" });
        }
    }

    async getSent(req: Request, res: Response): Promise<void> {
        const profileId = req.params.profileId as string;
        try {
            const result = await this.services.getSentRecommendations(profileId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch sent recommendations" });
        }
    }

    async getPending(req: SecureRequest, res: Response): Promise<void> {
        const profileId = req.user!.id;
        try {
            const result = await this.services.getPendingRecommendations(profileId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch pending recommendations" });
        }
    }

    async approve(req: SecureRequest, res: Response): Promise<void> {
        const id = req.params.id as string;
        const receiverId = req.user!.id;
        try {
            await this.services.approveRecommendation(id, receiverId);
            res.status(204).send();
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async reject(req: SecureRequest, res: Response): Promise<void> {
        const id = req.params.id as string;
        const receiverId = req.user!.id;
        try {
            await this.services.rejectRecommendation(id, receiverId);
            res.status(204).send();
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async delete(req: SecureRequest, res: Response): Promise<void> {
        const id = req.params.id as string;
        const profileId = req.user!.id;
        try {
            await this.services.deleteRecommendation(id, profileId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete recommendation" });
        }
    }
}
