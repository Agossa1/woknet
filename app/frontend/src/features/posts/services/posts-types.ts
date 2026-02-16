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
    created_at: string;
    updated_at: string;

    // Author info
    full_name?: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    headline?: string;

    // UI states
    isLiked?: boolean;

    // Share info
    share_id?: string;
    share_caption?: string;
    sharer_name?: string;
    sharer_avatar?: string;
    original_author_id?: string;
    original_author_name?: string;
    unique_id?: string;
}

export interface CreatePostDTO {
    profile_id?: string;
    content?: string;
    type?: PostType;
    visibility?: PostVisibility;
    media_url?: string;
    thumbnail_url?: string;
    tags?: string[];
    file?: File;
}

export interface UpdatePostDTO extends Partial<CreatePostDTO> {
    id: string;
}

export interface PostsState {
    feed: Post[];
    profilePosts: Record<string, Post[]>;
    loading: boolean;
    error: string | null;
}
