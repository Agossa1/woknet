import { SharesRepository } from "./shares.repository";
import { CreateShareDTO, Share } from "./shares.types";
import { socketService } from "../../infra/realtime/socket.service";
import { NotificationType } from "../notifications/notifications.types";
import { NotificationsService } from "../notifications/notifications.services";

export class SharesService {
    constructor(
        private readonly repository: SharesRepository,
        private readonly notificationsService: NotificationsService | null
    ) { }

    async sharePost(dto: CreateShareDTO): Promise<Share> {
        const share = await this.repository.create(dto);

        // TRIGGER NOTIFICATION: POST_SHARE
        if (this.notificationsService) {
            // We need the original author ID
            const post = await this.repository.findPostById(dto.post_id);
            if (post) {
                await this.notificationsService.createNotification({
                    recipient_id: post.profile_id,
                    sender_id: dto.profile_id,
                    type: NotificationType.POST_SHARE,
                    item_id: dto.post_id,
                    content: dto.caption
                });
                socketService.emitToUser(post.profile_id, 'new_notification', {});
            }
        }

        return share;
    }

    async unsharePost(id: string): Promise<boolean> {
        return this.repository.delete(id);
    }
}
