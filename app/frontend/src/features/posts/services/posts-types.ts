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
    media_urls?: string[];
    thumbnail_url?: string;
    tags?: string[];
    shares_count: number;
    likes_count: number;
    comments_count: number;
    background_color?: string;
    isSaved?: boolean;
    created_at: string;
    updated_at: string;

    // Author info
    full_name?: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    headline?: string;
    company_id?: string;
    company_size?: string;
    company_type?: string;

    // UI states
    isLiked?: boolean;
    reactionType?: ReactionType;
    reactionTypes?: ReactionType[];

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
    company_id?: string;
    content?: string;
    type?: PostType;
    visibility?: PostVisibility;
    media_url?: string | null;
    media_urls?: string[];
    thumbnail_url?: string;
    background_color?: string;
    tags?: string[];
    file?: File;
    files?: File[];
}

export interface UpdatePostDTO extends Partial<CreatePostDTO> {
    id: string;
}

// Types de réactions disponibles (doit correspondre au backend)
export enum ReactionType {
    LIKE = 'LIKE',           // 👍 J'aime
    CELEBRATE = 'CELEBRATE', // 🎉 Bravo
    SUPPORT = 'SUPPORT',     // 💪 Soutien
    LOVE = 'LOVE',           // ❤️ J'adore
    INSIGHTFUL = 'INSIGHTFUL', // 💡 Instructif
    FUNNY = 'FUNNY'          // 😂 Amusant
}

export interface LikeWithUser {
    profile_id: string;
    post_id?: string;
    comment_id?: string;
    reaction_type: ReactionType;
    created_at: string;
    full_name: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
}

export interface GetPostLikesResponse {
    likes: LikeWithUser[];
    count: number;
}

export interface PostsState {
    feed: Post[];
    profilePosts: Record<string, Post[]>;
    companyPosts: Record<string, Post[]>;
    savedPosts: Post[];
    loading: boolean;
    error: string | null;
}
