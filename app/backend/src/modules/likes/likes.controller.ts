import { Request, Response } from "express";
import Logger from "../../infra/logger/winston";
import { LikesServices } from "./likes.services";
import { LikeDTO } from "./likes.types";

export class LikesController {
    constructor(
        private readonly service: LikesServices,
        private readonly logger: Logger
    ) { }

    public toggle = async (req: Request, res: Response): Promise<void> => {
        try {
            const { post_id, comment_id, profile_id, reaction_type } = req.body;
            if ((!post_id && !comment_id) || !profile_id) {
                res.status(400).json({ error: "post_id or comment_id, and profile_id are required" });
                return;
            }
            const result = await this.service.toggleLike({ post_id, comment_id, profile_id, reaction_type });
            res.json(result);
        } catch (error) {
            this.handleError(res, error, "TOGGLE_LIKE_ERROR");
        }
    };

    public check = async (req: Request, res: Response): Promise<void> => {
        try {
            const postId = req.params.postId as string;
            const commentId = req.query.commentId as string;
            const profileId = req.query.profileId as string;

            if (!profileId) {
                res.status(400).json({ error: "profileId is required" });
                return;
            }

            const liked = await this.service.checkIfLiked({
                post_id: postId !== 'none' ? postId : undefined,
                comment_id: commentId,
                profile_id: profileId
            });
            res.json({ liked });
        } catch (error) {
            this.handleError(res, error, "CHECK_LIKE_ERROR");
        }
    };

    public getPostLikes = async (req: Request, res: Response): Promise<void> => {
        try {
            const postId = req.params.postId as string;

            if (!postId) {
                res.status(400).json({ error: "postId is required" });
                return;
            }

            const likes = await this.service.getPostLikesWithUsers(postId);
            res.json({ likes, count: likes.length });
        } catch (error) {
            this.handleError(res, error, "GET_POST_LIKES_ERROR");
        }
    };

    private handleError(res: Response, error: any, context: string) {
        this.logger.instance.error(`[LikesController] ${context}: ${error}`);
        res.status(500).json({ error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" });
    }
}
