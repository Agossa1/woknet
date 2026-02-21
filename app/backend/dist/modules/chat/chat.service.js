"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const socket_service_1 = require("../../infra/realtime/socket.service");
const link_preview_service_1 = require("../../utils/link-preview.service");
const notifications_types_1 = require("../notifications/notifications.types");
class ChatService {
    constructor(repository, logger, notificationsService = null) {
        this.repository = repository;
        this.logger = logger;
        this.notificationsService = notificationsService;
    }
    async getMyConversations(profileId) {
        return this.repository.getUserConversations(profileId);
    }
    async getMessages(conversationId, profileId, limit = 50, offset = 0) {
        return this.repository.getConversationMessages(conversationId, profileId, limit, offset);
    }
    async sendMessage(dto) {
        // Auto-detect links if it's text or link and no metadata is provided
        if ((dto.type === 'text' || dto.type === 'link' || !dto.type) && !dto.metadata) {
            const urls = link_preview_service_1.LinkPreviewService.extractUrls(dto.content);
            if (urls.length > 0) {
                const linkMeta = await link_preview_service_1.LinkPreviewService.getMetadata(urls[0]);
                if (linkMeta) {
                    dto.type = 'link';
                    dto.metadata = linkMeta;
                }
            }
        }
        const message = await this.repository.createMessage(dto);
        // Notify participants via socket
        const conversations_with_participants = await this.getMyConversations(dto.sender_id);
        const current_conv = conversations_with_participants.find(c => c.id === dto.conversation_id);
        if (current_conv && current_conv.participants) {
            current_conv.participants.forEach(async (p) => {
                if (p.profile_id !== dto.sender_id) {
                    // Socket event for immediate UI update / Toast
                    socket_service_1.socketService.emitToUser(p.profile_id, 'new_message', {
                        conversation_id: dto.conversation_id,
                        message: message
                    });
                    // Database entry for notification bell
                    if (this.notificationsService) {
                        try {
                            const notification = await this.notificationsService.createNotification({
                                recipient_id: p.profile_id,
                                sender_id: dto.sender_id,
                                type: notifications_types_1.NotificationType.NEW_MESSAGE,
                                item_id: dto.conversation_id,
                                content: dto.content.substring(0, 100)
                            });
                            if (notification) {
                                socket_service_1.socketService.emitToUser(p.profile_id, 'new_notification', notification);
                            }
                        }
                        catch (err) {
                            this.logger.instance.error("Error creating message notification", err);
                        }
                    }
                }
            });
        }
        return message;
    }
    async startConversation(profileId, targetProfileId) {
        // Check if direct conversation already exists
        const existingId = await this.repository.findExistingConversationBetween(profileId, targetProfileId);
        if (existingId) {
            const conversations = await this.repository.getUserConversations(profileId);
            return conversations.find(c => c.id === existingId);
        }
        const conversation = await this.repository.createConversation();
        await this.repository.addParticipant(conversation.id, profileId);
        await this.repository.addParticipant(conversation.id, targetProfileId);
        // Return full conversation with participants
        const conversations = await this.repository.getUserConversations(profileId);
        return conversations.find(c => c.id === conversation.id);
    }
    async markRead(conversationId, profileId) {
        await this.repository.markMessagesAsRead(conversationId, profileId);
        // Notify participants that messages were read
        const conversations = await this.repository.getUserConversations(profileId);
        const conv = conversations.find(c => c.id === conversationId);
        if (conv && conv.participants) {
            conv.participants.forEach((p) => {
                if (p.profile_id !== profileId) {
                    socket_service_1.socketService.emitToUser(p.profile_id, 'messages_read', {
                        conversation_id: conversationId,
                        reader_id: profileId
                    });
                }
            });
        }
        return { success: true };
    }
}
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map