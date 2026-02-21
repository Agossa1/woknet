"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowsController = void 0;
class FollowsController {
    constructor(services) {
        this.services = services;
    }
    async toggleFollow(req, res) {
        try {
            const follower_id = req.user.id;
            const { following_id } = req.body;
            if (follower_id === following_id) {
                res.status(400).json({ error: "You cannot follow yourself" });
                return;
            }
            const result = await this.services.toggleFollow({ follower_id, following_id });
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getFollowers(req, res) {
        try {
            const profileId = req.params.profileId;
            const currentUserId = req.user?.id;
            const followers = await this.services.getFollowers(profileId, currentUserId);
            res.status(200).json(followers);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getFollowing(req, res) {
        try {
            const profileId = req.params.profileId;
            const currentUserId = req.user?.id;
            const following = await this.services.getFollowing(profileId, currentUserId);
            res.status(200).json(following);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getCounts(req, res) {
        try {
            const profileId = req.params.profileId;
            const counts = await this.services.getCounts(profileId);
            res.status(200).json(counts);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async checkStatus(req, res) {
        try {
            const follower_id = req.user.id;
            const profileId = req.params.profileId;
            const following = await this.services.checkFollowStatus({ follower_id, following_id: profileId });
            res.status(200).json({ following });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.FollowsController = FollowsController;
//# sourceMappingURL=follows.controller.js.map