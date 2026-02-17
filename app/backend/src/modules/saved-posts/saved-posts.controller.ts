import { Request, Response } from "express";
import { SavedPostsServices } from "./saved-posts.services";

export class SavedPostsController {
    constructor(private readonly services: SavedPostsServices) { }

    toggle = async (req: Request, res: Response) => {
        try {
            const postId = req.params.postId as string;
            const profileId = (req as any).user.id; // On assume que l'ID utilisateur est le même que le profile_id

            const result = await this.services.toggleSavePost({
                profile_id: profileId,
                post_id: postId
            });

            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    getSaved = async (req: Request, res: Response) => {
        try {
            const profileId = (req as any).user.id;
            const saved = await this.services.getSavedPosts(profileId);
            res.status(200).json(saved);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };
}
