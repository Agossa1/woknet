export interface Conversation {
    id: string;
    created_at: string;
    updated_at: string;
    participants: ChatParticipant[];
    last_message?: ChatMessage;
    unread_count?: number; // Calculated on frontend or specific endpoint
}

export interface ChatParticipant {
    profile_id: string;
    display_name: string;
    avatar_url: string;
}

export interface ChatMessage {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'sticker' | 'link';
    metadata?: any;
    is_read: boolean;
    created_at: string;
}

export interface ChatState {
    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Record<string, ChatMessage[]>; // Map of conversationId -> messages
    loading: boolean;
    error: string | null;
    isDrawerOpen: boolean;
    onlineUsers: string[];
    typingUsers: Record<string, string[]>;
}
