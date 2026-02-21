"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationsController = void 0;
const recommendations_service_1 = require("./recommendations.service");
class RecommendationsController {
    constructor() {
        this.track = async (req, res) => {
            const { item_id, item_type, action_type, metadata } = req.body;
            // Asynchronous tracking: We respond immediately
            this.service.trackSignal({
                user_id: req.user.id,
                item_id,
                item_type,
                action_type,
                metadata
            });
            return res.status(202).json({ success: true, message: 'Signal captured' });
        };
        this.getProfileSuggestions = async (req, res) => {
            const limit = parseInt(req.query.limit) || 10;
            const suggestions = await this.service.getProfileRecommendations(req.user.id, limit);
            return res.status(200).json(suggestions);
        };
        this.getJobSuggestions = async (req, res) => {
            const limit = parseInt(req.query.limit) || 10;
            const suggestions = await this.service.getJobRecommendations(req.user.id, limit);
            return res.status(200).json(suggestions);
        };
        this.service = new recommendations_service_1.RecommendationsService();
    }
}
exports.RecommendationsController = RecommendationsController;
//# sourceMappingURL=recommendations.controller.js.map