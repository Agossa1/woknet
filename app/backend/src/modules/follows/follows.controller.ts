import { Request, Response } from "express";
import { FollowsServices } from "./follows.services";

export class FollowsController {
    constructor(private readonly services: FollowsServices) { }

    async toggleFollow(req: Request, res: Response): Promise<void> {
        try {
            const follower_id = (req as any).user.id;
            const { following_id } = req.body;

            if (follower_id === following_id) {
                res.status(400).json({ error: "You cannot follow yourself" });
                return;
            }

            const result = await this.services.toggleFollow({ follower_id, following_id });
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getFollowers(req: Request, res: Response): Promise<void> {
        try {
            const profileId = req.params.profileId as string;
            const currentUserId = (req as any).user?.id;
            const followers = await this.services.getFollowers(profileId, currentUserId);
            res.status(200).json(followers);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getFollowing(req: Request, res: Response): Promise<void> {
        try {
            const profileId = req.params.profileId as string;
            const currentUserId = (req as any).user?.id;
            const following = await this.services.getFollowing(profileId, currentUserId);
            res.status(200).json(following);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCounts(req: Request, res: Response): Promise<void> {
        try {
            const profileId = req.params.profileId as string;
            const counts = await this.services.getCounts(profileId);
            res.status(200).json(counts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async checkStatus(req: Request, res: Response): Promise<void> {
        try {
            const follower_id = (req as any).user.id;
            const profileId = req.params.profileId as string;
            const following = await this.services.checkFollowStatus({ follower_id, following_id: profileId });
            res.status(200).json({ following });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
