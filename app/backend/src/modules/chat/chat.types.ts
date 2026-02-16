export interface Conversation {
    id: string;
    created_at: Date;
    updated_at: Date;
    participants?: ConversationParticipant[];
    last_message?: Message;
}

export interface ConversationParticipant {
    conversation_id: string;
    profile_id: string;
    joined_at: Date;
    display_name?: string;
    avatar_url?: string;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'sticker' | 'link';
    metadata?: any;
    is_read: boolean;
    created_at: Date;
}

export interface CreateMessageDTO {
    conversation_id: string;
    sender_id: string;
    content: string;
    type?: 'text' | 'image' | 'file' | 'sticker' | 'link';
    metadata?: any;
}

export interface CreateConversationDTO {
    participant_ids: string[]; // List of profile IDs
}
