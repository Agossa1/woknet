export type FeaturedType = 'POST' | 'PROJECT' | 'EXTERNAL_LINK';

export interface FeaturedContentDTO {
    id: string;
    profile_id: string;
    type: FeaturedType;
    target_id: string | null;
    title: string | null;
    description: string | null;
    thumbnail_url: string | null;
    external_url: string | null;
    order_index: number;
    created_at: Date;
}

export interface CreateFeaturedContentDTO {
    profile_id: string;
    type: FeaturedType;
    target_id?: string | null;
    title?: string | null;
    description?: string | null;
    thumbnail_url?: string | null;
    external_url?: string | null;
    order_index?: number;
}

export interface UpdateFeaturedContentDTO {
    title?: string | null;
    description?: string | null;
    thumbnail_url?: string | null;
    external_url?: string | null;
    order_index?: number;
}

export interface IDatabase {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
}
