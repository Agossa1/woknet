import { Response } from "express";
import { SecureRequest } from "../../infra/middleware/auth.middleware";
import { SharesService } from "./shares.service";
import Logger from "../../infra/logger/winston";

export class SharesController {
    constructor(
        private readonly service: SharesService,
        private readonly logger: Logger
    ) { }

    share = async (req: SecureRequest, res: Response) => {
        try {
            const { post_id, caption } = req.body;
            const profile_id = req.user!.id;

            if (!post_id) {
                return res.status(400).json({ message: "post_id is required" });
            }

            const share = await this.service.sharePost({
                post_id,
                profile_id,
                caption
            });

            return res.status(201).json(share);
        } catch (error: any) {
            this.logger.instance.error(`[SharesController] Share post error: ${error.message}`);
            return res.status(500).json({ message: error.message });
        }
    };

    unshare = async (req: SecureRequest, res: Response) => {
        try {
            const id = req.params.id as string;
            const success = await this.service.unsharePost(id);

            if (success) {
                return res.status(200).json({ success: true });
            } else {
                return res.status(404).json({ message: "Share not found" });
            }
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    };
}
