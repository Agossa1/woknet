export interface Share {
    id: string;
    profile_id: string;
    post_id: string;
    caption?: string;
    created_at: Date;
}

export interface CreateShareDTO {
    post_id: string;
    profile_id: string;
    caption?: string;
}
