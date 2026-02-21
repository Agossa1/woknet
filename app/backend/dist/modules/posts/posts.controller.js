"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsController = void 0;
class PostsController {
    constructor(service, logger) {
        this.service = service;
        this.logger = logger;
        this.create = async (req, res) => {
            try {
                const dto = req.body;
                const file = req.file;
                // Get profile_id from authenticated user if not provided
                if (!dto.profile_id && req.user) {
                    dto.profile_id = req.user.id;
                }
                if (!dto.profile_id) {
                    res.status(401).json({ error: "Authentication required" });
                    return;
                }
                const post = await this.service.createPost(dto, file?.buffer, file?.mimetype);
                res.status(201).json(post);
            }
            catch (error) {
                this.handleError(res, error, "CREATE_POST_ERROR");
            }
        };
        this.getById = async (req, res) => {
            try {
                const id = req.params.id;
                const post = await this.service.getPostById(id);
                if (!post) {
                    res.status(404).json({ error: "Post not found" });
                    return;
                }
                res.json(post);
            }
            catch (error) {
                this.handleError(res, error, "GET_POST_ERROR");
            }
        };
        this.getProfilePosts = async (req, res) => {
            try {
                const profileId = req.params.profileId;
                const currentProfileId = req.user?.id;
                const posts = await this.service.getProfilePosts(profileId, currentProfileId);
                res.json(posts);
            }
            catch (error) {
                this.handleError(res, error, "GET_PROFILE_POSTS_ERROR");
            }
        };
        this.getCompanyPosts = async (req, res) => {
            try {
                const companyId = req.params.companyId;
                const currentProfileId = req.user?.id;
                const posts = await this.service.getCompanyPosts(companyId, currentProfileId);
                res.json(posts);
            }
            catch (error) {
                this.handleError(res, error, "GET_COMPANY_POSTS_ERROR");
            }
        };
        this.getFeed = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const currentProfileId = req.user?.id;
                const posts = await this.service.getFeed(page, limit, currentProfileId);
                res.json(posts);
            }
            catch (error) {
                this.handleError(res, error, "GET_FEED_ERROR");
            }
        };
        this.update = async (req, res) => {
            try {
                const id = req.params.id;
                const dto = { ...req.body, id };
                const post = await this.service.updatePost(id, dto);
                res.json(post);
            }
            catch (error) {
                this.handleError(res, error, "UPDATE_POST_ERROR");
            }
        };
        this.delete = async (req, res) => {
            try {
                const id = req.params.id;
                await this.service.deletePost(id);
                res.status(204).send();
            }
            catch (error) {
                this.handleError(res, error, "DELETE_POST_ERROR");
            }
        };
    }
    handleError(res, error, context) {
        this.logger.instance.error(`[PostsController] ${context}: ${error}`);
        res.status(500).json({ error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" });
    }
}
exports.PostsController = PostsController;
//# sourceMappingURL=posts.controller.js.map