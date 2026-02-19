export type FeedContentType = 'POST' | 'JOB' | 'EVENT' | 'GROUP' | 'USER' | 'RECOMMENDATION_BLOCK';

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

 

 

// Dans ton slice, assure-toi de vider le feed lors d'un refresh 
// pour éviter de mélanger les anciennes versions non diversifiées.