import { Response } from "express";
import { SecureRequest } from "../../infra/middleware/auth.middleware";
import { HashtagsService } from "./hashtags.service";

export class HashtagsController {
    private service: HashtagsService;

    constructor() {
        this.service = new HashtagsService();
    }

    getTrending = async (req: SecureRequest, res: Response) => {
        try {
            const limit = parseInt(req.query.limit as string) || 10;
            const trending = await this.service.getTrending(limit);
            return res.status(200).json(trending);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    };

    search = async (req: SecureRequest, res: Response) => {
        try {
            const query = (req.query.q as string) || "";
            const limit = parseInt(req.query.limit as string) || 20;
            if (!query) return res.status(400).json({ message: "Search query is required" });

            const results = await this.service.search(query, limit);
            return res.status(200).json(results);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    };

    getPostsByHashtag = async (req: SecureRequest, res: Response) => {
        try {
            const name = req.params.name as string;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = parseInt(req.query.offset as string) || 0;

            const posts = await this.service.getPostsByHashtag(name, limit, offset, req.user?.id);
            return res.status(200).json(posts);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    };

    getDetails = async (req: SecureRequest, res: Response) => {
        try {
            const name = req.params.name as string;
            const details = await this.service.getHashtagDetails(name);
            if (!details) return res.status(404).json({ message: "Hashtag not found" });

            return res.status(200).json(details);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    };
}
