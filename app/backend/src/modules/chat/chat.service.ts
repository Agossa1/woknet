import Logger from "../../infra/logger/winston";
import { ChatRepository } from "./chat.repository";
import { CreateMessageDTO, CreateConversationDTO, Message } from "./chat.types";
import { socketService } from "../../infra/realtime/socket.service";
import { LinkPreviewService } from "../../utils/link-preview.service";

export class ChatService {
    constructor(
        private readonly repository: ChatRepository,
        private readonly logger: Logger
    ) { }

    async getMyConversations(profileId: string) {
        return this.repository.getUserConversations(profileId);
    }

    async getMessages(conversationId: string, profileId: string, limit: number = 50, offset: number = 0) {
        return this.repository.getConversationMessages(conversationId, profileId, limit, offset);
    }

    async sendMessage(dto: CreateMessageDTO) {
        // Auto-detect links if it's text or link and no metadata is provided
        if ((dto.type === 'text' || dto.type === 'link' || !dto.type) && !dto.metadata) {
            const urls = LinkPreviewService.extractUrls(dto.content);
            if (urls.length > 0) {
                const linkMeta = await LinkPreviewService.getMetadata(urls[0]);
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
            current_conv.participants.forEach((p: any) => {
                if (p.profile_id !== dto.sender_id) {
                    socketService.emitToUser(p.profile_id, 'new_message', {
                        conversation_id: dto.conversation_id,
                        message: message
                    });
                }
            });
        }

        return message;
    }

    async startConversation(profileId: string, targetProfileId: string) {
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

    async markRead(conversationId: string, profileId: string) {
        await this.repository.markMessagesAsRead(conversationId, profileId);

        // Notify participants that messages were read
        const conversations = await this.repository.getUserConversations(profileId);
        const conv = conversations.find(c => c.id === conversationId);

        if (conv && conv.participants) {
            conv.participants.forEach((p: any) => {
                if (p.profile_id !== profileId) {
                    socketService.emitToUser(p.profile_id, 'messages_read', {
                        conversation_id: conversationId,
                        reader_id: profileId
                    });
                }
            });
        }

        return { success: true };
    }
}
