import Logger from "../../infra/logger/winston";
import { MentionsRepository } from "./mentions.repository";
import { ProfilesRepository } from "../profiles/profiles.repository";
import { NotificationsService } from "../notifications/notifications.services";
import { NotificationType } from "../notifications/notifications.types";

export class MentionsService {
    constructor(
        private readonly mentionsRepository: MentionsRepository,
        private readonly profilesRepository: ProfilesRepository,
        private readonly notificationsService: NotificationsService,
        private readonly logger: Logger
    ) { }

    /**
     * Parse du texte pour trouver des @username et créer les mentions associées.
     */
    async processMentions(
        textContent: string,
        senderId: string,
        entityType: 'post' | 'comment' | 'chat',
        entityId: string
    ): Promise<void> {
        try {
            const mentionRegex = /@([a-zA-Z0-9._]+)/g;
            const matches = [...textContent.matchAll(mentionRegex)];

            if (matches.length === 0) return;

            const usernames = [...new Set(matches.map(match => match[1]))];

            for (const username of usernames) {
                // Trouver l'utilisateur par son username
                const sql = `SELECT user_id FROM profiles WHERE username = $1`;
                const results = await (this.mentionsRepository as any).db.query(sql, [username]);

                if (results.length > 0) {
                    const receiverId = results[0].user_id;

                    // Éviter de se mentionner soi-même (optionnel selon le choix métier)
                    if (receiverId === senderId) continue;

                    // Créer la mention en DB
                    await this.mentionsRepository.createMention({
                        sender_id: senderId,
                        receiver_id: receiverId,
                        entity_type: entityType,
                        entity_id: entityId,
                        text_content: textContent.substring(0, 100)
                    });

                    // Envoyer une notification
                    await this.notificationsService.createNotification({
                        recipient_id: receiverId,
                        sender_id: senderId,
                        type: NotificationType.MENTION,
                        item_id: entityId,
                        content: `vous a mentionné dans un ${entityType === 'post' ? 'post' : 'commentaire'}`
                    });
                }
            }
        } catch (error) {
            this.logger.instance.error("[MentionsService] Error processing mentions", error);
        }
    }
}
