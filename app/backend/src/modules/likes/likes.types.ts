export interface Like {
    profile_id: string;
    post_id?: string;
    comment_id?: string;
    created_at: Date | string;
}

export interface LikeDTO {
    profile_id: string;
    post_id?: string;
    comment_id?: string;
}
