export interface Hashtag {
    id: string;
    name: string;
    usage_count: number;
    last_used_at: Date;
    created_at: Date;
    updated_at: Date;
}

export interface TrendingHashtag {
    id: string;
    name: string;
    usage_count: number;
    posts_last_week: number;
    posts_last_day: number;
}

export interface HashtagWithPosts extends Hashtag {
    post_count: number;
}
