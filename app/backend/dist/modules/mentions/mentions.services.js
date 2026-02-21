"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentionsService = void 0;
const notifications_types_1 = require("../notifications/notifications.types");
class MentionsService {
    constructor(mentionsRepository, profilesRepository, notificationsService, logger) {
        this.mentionsRepository = mentionsRepository;
        this.profilesRepository = profilesRepository;
        this.notificationsService = notificationsService;
        this.logger = logger;
    }
    /**
     * Parse du texte pour trouver des @username et créer les mentions associées.
     */
    async processMentions(textContent, senderId, entityType, entityId) {
        try {
            const mentionRegex = /@([a-zA-Z0-9._]+)/g;
            const matches = [...textContent.matchAll(mentionRegex)];
            if (matches.length === 0)
                return;
            const usernames = [...new Set(matches.map(match => match[1]))];
            for (const username of usernames) {
                // Trouver l'utilisateur par son username
                const sql = `SELECT user_id FROM profiles WHERE username = $1`;
                const results = await this.mentionsRepository.db.query(sql, [username]);
                if (results.length > 0) {
                    const receiverId = results[0].user_id;
                    // Éviter de se mentionner soi-même (optionnel selon le choix métier)
                    if (receiverId === senderId)
                        continue;
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
                        type: notifications_types_1.NotificationType.MENTION,
                        item_id: entityId,
                        content: `vous a mentionné dans un ${entityType === 'post' ? 'post' : 'commentaire'}`
                    });
                }
            }
        }
        catch (error) {
            this.logger.instance.error("[MentionsService] Error processing mentions", error);
        }
    }
}
exports.MentionsService = MentionsService;
//# sourceMappingURL=mentions.services.js.map