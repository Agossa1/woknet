"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharesController = void 0;
class SharesController {
    constructor(service, logger) {
        this.service = service;
        this.logger = logger;
        this.share = async (req, res) => {
            try {
                const { post_id, caption } = req.body;
                const profile_id = req.user.id;
                if (!post_id) {
                    return res.status(400).json({ message: "post_id is required" });
                }
                const share = await this.service.sharePost({
                    post_id,
                    profile_id,
                    caption
                });
                return res.status(201).json(share);
            }
            catch (error) {
                this.logger.instance.error(`[SharesController] Share post error: ${error.message}`);
                return res.status(500).json({ message: error.message });
            }
        };
        this.unshare = async (req, res) => {
            try {
                const id = req.params.id;
                const success = await this.service.unsharePost(id);
                if (success) {
                    return res.status(200).json({ success: true });
                }
                else {
                    return res.status(404).json({ message: "Share not found" });
                }
            }
            catch (error) {
                return res.status(500).json({ message: error.message });
            }
        };
    }
}
exports.SharesController = SharesController;
//# sourceMappingURL=shares.controller.js.map