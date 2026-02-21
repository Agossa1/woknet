"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashtagsController = void 0;
const hashtags_service_1 = require("./hashtags.service");
class HashtagsController {
    constructor() {
        this.getTrending = async (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 10;
                const trending = await this.service.getTrending(limit);
                return res.status(200).json(trending);
            }
            catch (error) {
                return res.status(500).json({ message: error.message });
            }
        };
        this.search = async (req, res) => {
            try {
                const query = req.query.q || "";
                const limit = parseInt(req.query.limit) || 20;
                if (!query)
                    return res.status(400).json({ message: "Search query is required" });
                const results = await this.service.search(query, limit);
                return res.status(200).json(results);
            }
            catch (error) {
                return res.status(500).json({ message: error.message });
            }
        };
        this.getPostsByHashtag = async (req, res) => {
            try {
                const name = req.params.name;
                const limit = parseInt(req.query.limit) || 20;
                const offset = parseInt(req.query.offset) || 0;
                const posts = await this.service.getPostsByHashtag(name, limit, offset, req.user?.id);
                return res.status(200).json(posts);
            }
            catch (error) {
                return res.status(500).json({ message: error.message });
            }
        };
        this.getDetails = async (req, res) => {
            try {
                const name = req.params.name;
                const details = await this.service.getHashtagDetails(name);
                if (!details)
                    return res.status(404).json({ message: "Hashtag not found" });
                return res.status(200).json(details);
            }
            catch (error) {
                return res.status(500).json({ message: error.message });
            }
        };
        this.service = new hashtags_service_1.HashtagsService();
    }
}
exports.HashtagsController = HashtagsController;
//# sourceMappingURL=hashtags.controller.js.map