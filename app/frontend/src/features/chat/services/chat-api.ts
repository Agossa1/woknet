import { api } from "../../api/apiClients";
import { Conversation, ChatMessage } from "./chat-types";

export const chatApi = {
    getConversations: () => api.get<Conversation[]>("/chat/conversations"),

    getMessages: (conversationId: string, limit: number = 50, offset: number = 0) =>
        api.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`),

    sendMessage: (conversationId: string, content: string, type: string = 'text', metadata: any = {}) =>
        api.post<ChatMessage>("/chat/messages", { conversationId, content, type, metadata }),

    startConversation: (targetProfileId: string) =>
        api.post<Conversation>("/chat/conversations", { targetProfileId }),

    markAsRead: (conversationId: string) =>
        api.patch<{ success: true }>(`/chat/conversations/${conversationId}/read`, {}),
};
