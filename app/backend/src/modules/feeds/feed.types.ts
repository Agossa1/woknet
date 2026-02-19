export type FeedContentType = 'POST' | 'JOB' | 'EVENT' | 'GROUP' | 'USER' | 'RECOMMENDATION_PROFILES' | 'RECOMMENDATION_JOBS';

export interface FeedItem {
    item_id: string;
    author_id: string;
    author_full_name: string;
    author_avatar_url: string
    content_type: FeedContentType;
    title: string;
    media_url: string;
    base_score: number;
    created_at: Date;
    tags?: string[];
    data: any
}