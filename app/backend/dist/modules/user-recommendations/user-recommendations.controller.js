"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRecommendationsController = void 0;
class UserRecommendationsController {
    constructor(services) {
        this.services = services;
    }
    async create(req, res) {
        const giverId = req.user.id;
        const { receiver_id, content, relationship } = req.body;
        try {
            const result = await this.services.giveRecommendation(giverId, receiver_id, content, relationship);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to create recommendation" });
        }
    }
    async getReceived(req, res) {
        const profileId = req.params.profileId;
        try {
            const result = await this.services.getProfileRecommendations(profileId);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch recommendations" });
        }
    }
    async getSent(req, res) {
        const profileId = req.params.profileId;
        try {
            const result = await this.services.getSentRecommendations(profileId);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch sent recommendations" });
        }
    }
    async getPending(req, res) {
        const profileId = req.user.id;
        try {
            const result = await this.services.getPendingRecommendations(profileId);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch pending recommendations" });
        }
    }
    async approve(req, res) {
        const id = req.params.id;
        const receiverId = req.user.id;
        try {
            await this.services.approveRecommendation(id, receiverId);
            res.status(204).send();
        }
        catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }
    async reject(req, res) {
        const id = req.params.id;
        const receiverId = req.user.id;
        try {
            await this.services.rejectRecommendation(id, receiverId);
            res.status(204).send();
        }
        catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }
    async delete(req, res) {
        const id = req.params.id;
        const profileId = req.user.id;
        try {
            await this.services.deleteRecommendation(id, profileId);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: "Failed to delete recommendation" });
        }
    }
}
exports.UserRecommendationsController = UserRecommendationsController;
//# sourceMappingURL=user-recommendations.controller.js.map