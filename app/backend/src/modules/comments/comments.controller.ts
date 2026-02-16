import { Request, Response } from "express";
import Logger from "../../infra/logger/winston";
import { CommentsServices } from "./comments.services";
import { CreateCommentDTO, UpdateCommentDTO } from "./comments.types";

export class CommentsController {
    constructor(
        private readonly service: CommentsServices,
        private readonly logger: Logger
    ) { }

    public create = async (req: any, res: Response): Promise<void> => {
        try {
            const dto: CreateCommentDTO = req.body;
            // Override profile_id with authenticated user id for security
            if (req.user?.id) {
                dto.profile_id = req.user.id;
            }

            if (!dto.post_id || !dto.profile_id || !dto.content) {
                res.status(400).json({ error: "post_id, profile_id and content are required" });
                return;
            }
            const comment = await this.service.createComment(dto);
            res.status(201).json(comment);
        } catch (error) {
            this.handleError(res, error, "CREATE_COMMENT_ERROR");
        }
    };

    public getByPost = async (req: any, res: Response): Promise<void> => {
        try {
            const postId = req.params.postId as string;
            const currentProfileId = req.user?.id;
            const comments = await this.service.getPostComments(postId, currentProfileId);
            res.json(comments);
        } catch (error) {
            this.handleError(res, error, "GET_POST_COMMENTS_ERROR");
        }
    };

    public getReplies = async (req: any, res: Response): Promise<void> => {
        try {
            const parentId = req.params.parentId as string;
            const currentProfileId = req.user?.id;
            const replies = await this.service.getReplies(parentId, currentProfileId);
            res.json(replies);
        } catch (error) {
            this.handleError(res, error, "GET_REPLIES_ERROR");
        }
    };

    public update = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id as string;
            const dto: UpdateCommentDTO = req.body;
            const comment = await this.service.updateComment(id, dto);
            res.json(comment);
        } catch (error) {
            this.handleError(res, error, "UPDATE_COMMENT_ERROR");
        }
    };

    public delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id as string;
            await this.service.deleteComment(id);
            res.status(204).send();
        } catch (error) {
            this.handleError(res, error, "DELETE_COMMENT_ERROR");
        }
    };

    private handleError(res: Response, error: any, context: string) {
        this.logger.instance.error(`[CommentsController] ${context}: ${error}`);
        res.status(500).json({ error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" });
    }
}
