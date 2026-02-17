export enum NotificationType {
    POST_LIKE = 'POST_LIKE',
    COMMENT_LIKE = 'COMMENT_LIKE',
    POST_COMMENT = 'POST_COMMENT',
    POST_SHARE = 'POST_SHARE',
    NEW_FOLLOW = 'NEW_FOLLOW',
    CONNECTION_REQUEST = 'CONNECTION_REQUEST',
    NEW_MESSAGE = 'NEW_MESSAGE',
    SYSTEM = 'SYSTEM'
}

export interface Notification {
    id: string;
    recipient_id: string;
    sender_id?: string;
    type: NotificationType;
    item_id?: string;
    content?: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;

    // Joined fields
    sender_name?: string;
    sender_avatar?: string;
}

export interface NotificationsState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
}
