export interface Comment {
    id: string;
    post_id: string;
    profile_id: string;
    parent_id?: string | null;
    content: string;
    likes_count: number;
    comments_count: number;
    created_at: Date | string;
    updated_at: Date | string;

    // Populated author info
    full_name?: string;
    username?: string;
    avatar_url?: string;
    headline?: string;
    isLiked?: boolean;
}

export interface CreateCommentDTO {
    post_id: string;
    profile_id: string;
    parent_id?: string | null;
    content: string;
}

export interface UpdateCommentDTO {
    content: string;
}
