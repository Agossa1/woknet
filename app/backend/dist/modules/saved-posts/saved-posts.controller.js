"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedPostsController = void 0;
class SavedPostsController {
    constructor(services) {
        this.services = services;
        this.toggle = async (req, res) => {
            try {
                const postId = req.params.postId;
                const profileId = req.user.id; // On assume que l'ID utilisateur est le même que le profile_id
                const result = await this.services.toggleSavePost({
                    profile_id: profileId,
                    post_id: postId
                });
                res.status(200).json(result);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        this.getSaved = async (req, res) => {
            try {
                const profileId = req.user.id;
                const saved = await this.services.getSavedPosts(profileId);
                res.status(200).json(saved);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
    }
}
exports.SavedPostsController = SavedPostsController;
//# sourceMappingURL=saved-posts.controller.js.map