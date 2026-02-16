import { Request, Response } from "express";
import Logger from "../../infra/logger/winston";
import { PostsServices } from "./posts.services";
import { CreatePostDTO, UpdatePostDTO } from "./posts.types";

export class PostsController {
    constructor(
        private readonly service: PostsServices,
        private readonly logger: Logger
    ) { }

    public create = async (req: any, res: Response): Promise<void> => {
        try {
            const dto: CreatePostDTO = req.body;
            const file = req.file;

            // Get profile_id from authenticated user if not provided
            if (!dto.profile_id && req.user) {
                dto.profile_id = req.user.id;
            }

            if (!dto.profile_id) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }

            const post = await this.service.createPost(
                dto,
                file?.buffer,
                file?.mimetype
            );
            res.status(201).json(post);
        } catch (error) {
            this.handleError(res, error, "CREATE_POST_ERROR");
        }
    };

    public getById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id as string;
            const post = await this.service.getPostById(id);
            if (!post) {
                res.status(404).json({ error: "Post not found" });
                return;
            }
            res.json(post);
        } catch (error) {
            this.handleError(res, error, "GET_POST_ERROR");
        }
    };

    public getProfilePosts = async (req: any, res: Response): Promise<void> => {
        try {
            const profileId = req.params.profileId as string;
            const currentProfileId = req.user?.id;
            const posts = await this.service.getProfilePosts(profileId, currentProfileId);
            res.json(posts);
        } catch (error) {
            this.handleError(res, error, "GET_PROFILE_POSTS_ERROR");
        }
    };

    public getFeed = async (req: any, res: Response): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const currentProfileId = req.user?.id;
            const posts = await this.service.getFeed(page, limit, currentProfileId);
            res.json(posts);
        } catch (error) {
            this.handleError(res, error, "GET_FEED_ERROR");
        }
    };

    public update = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id as string;
            const dto: UpdatePostDTO = { ...req.body, id };
            const post = await this.service.updatePost(id, dto);
            res.json(post);
        } catch (error) {
            this.handleError(res, error, "UPDATE_POST_ERROR");
        }
    };

    public delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id as string;
            await this.service.deletePost(id);
            res.status(204).send();
        } catch (error) {
            this.handleError(res, error, "DELETE_POST_ERROR");
        }
    };

    private handleError(res: Response, error: any, context: string) {
        this.logger.instance.error(`[PostsController] ${context}: ${error}`);
        res.status(500).json({ error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" });
    }
}
