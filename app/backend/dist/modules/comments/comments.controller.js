"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsController = void 0;
class CommentsController {
    constructor(service, logger) {
        this.service = service;
        this.logger = logger;
        this.create = async (req, res) => {
            try {
                const dto = req.body;
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
            }
            catch (error) {
                this.handleError(res, error, "CREATE_COMMENT_ERROR");
            }
        };
        this.getByPost = async (req, res) => {
            try {
                const postId = req.params.postId;
                const currentProfileId = req.user?.id;
                const comments = await this.service.getPostComments(postId, currentProfileId);
                res.json(comments);
            }
            catch (error) {
                this.handleError(res, error, "GET_POST_COMMENTS_ERROR");
            }
        };
        this.getReplies = async (req, res) => {
            try {
                const parentId = req.params.parentId;
                const currentProfileId = req.user?.id;
                const replies = await this.service.getReplies(parentId, currentProfileId);
                res.json(replies);
            }
            catch (error) {
                this.handleError(res, error, "GET_REPLIES_ERROR");
            }
        };
        this.update = async (req, res) => {
            try {
                const id = req.params.id;
                const dto = req.body;
                const comment = await this.service.updateComment(id, dto);
                res.json(comment);
            }
            catch (error) {
                this.handleError(res, error, "UPDATE_COMMENT_ERROR");
            }
        };
        this.delete = async (req, res) => {
            try {
                const id = req.params.id;
                await this.service.deleteComment(id);
                res.status(204).send();
            }
            catch (error) {
                this.handleError(res, error, "DELETE_COMMENT_ERROR");
            }
        };
    }
    handleError(res, error, context) {
        this.logger.instance.error(`[CommentsController] ${context}: ${error}`);
        res.status(500).json({ error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" });
    }
}
exports.CommentsController = CommentsController;
//# sourceMappingURL=comments.controller.js.map