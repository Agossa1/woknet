"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikesController = void 0;
class LikesController {
    constructor(service, logger) {
        this.service = service;
        this.logger = logger;
        this.toggle = async (req, res) => {
            try {
                const { post_id, comment_id, profile_id, reaction_type } = req.body;
                if ((!post_id && !comment_id) || !profile_id) {
                    res.status(400).json({ error: "post_id or comment_id, and profile_id are required" });
                    return;
                }
                const result = await this.service.toggleLike({ post_id, comment_id, profile_id, reaction_type });
                res.json(result);
            }
            catch (error) {
                this.handleError(res, error, "TOGGLE_LIKE_ERROR");
            }
        };
        this.check = async (req, res) => {
            try {
                const postId = req.params.postId;
                const commentId = req.query.commentId;
                const profileId = req.query.profileId;
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
            }
            catch (error) {
                this.handleError(res, error, "CHECK_LIKE_ERROR");
            }
        };
        this.getPostLikes = async (req, res) => {
            try {
                const postId = req.params.postId;
                if (!postId) {
                    res.status(400).json({ error: "postId is required" });
                    return;
                }
                const likes = await this.service.getPostLikesWithUsers(postId);
                res.json({ likes, count: likes.length });
            }
            catch (error) {
                this.handleError(res, error, "GET_POST_LIKES_ERROR");
            }
        };
    }
    handleError(res, error, context) {
        this.logger.instance.error(`[LikesController] ${context}: ${error}`);
        res.status(500).json({ error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" });
    }
}
exports.LikesController = LikesController;
//# sourceMappingURL=likes.controller.js.map