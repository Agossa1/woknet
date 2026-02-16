export enum PostType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    DOCUMENT = 'DOCUMENT',
    LINK = 'LINK'
}

export enum PostVisibility {
    PUBLIC = 'PUBLIC',
    CONNECTIONS = 'CONNECTIONS',
    PRIVATE = 'PRIVATE'
}

export interface Post {
    id: string;
    profile_id: string;
    content?: string;
    type: PostType;
    visibility: PostVisibility;
    media_url?: string;
    thumbnail_url?: string;
    tags?: string[];
    likes_count: number;
    comments_count: number;
    shares_count: number;
    created_at: Date | string;
    updated_at: Date | string;

    // Author info (populated via joins)
    full_name?: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    headline?: string;
    isLiked?: boolean;

    // Share info
    share_id?: string;
    share_caption?: string;
    sharer_name?: string;
    sharer_avatar?: string;
    original_author_id?: string;
    original_author_name?: string;
}

export interface CreatePostDTO {
    profile_id: string;
    content?: string;
    type?: PostType;
    visibility?: PostVisibility;
    media_url?: string;
    thumbnail_url?: string;
    tags?: string[];
}

export interface UpdatePostDTO extends Partial<Omit<CreatePostDTO, 'profile_id'>> {
    id: string;
}
