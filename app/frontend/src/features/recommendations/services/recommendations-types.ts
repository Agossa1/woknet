export type RecommendationSignalType = 'VIEW' | 'CLICK' | 'LIKE' | 'COMMENT' | 'SHARE' | 'SAVE' | 'DISMISS' | 'SEARCH' | 'APPLY' | 'CONNECT';
export type RecommendationItemType = 'POST' | 'JOB' | 'USER' | 'COMPANY' | 'SKILL' | 'COMMUNITY';

export interface RecommendationSignal {
    item_id: string;
    item_type: RecommendationItemType;
    action_type: RecommendationSignalType;
    metadata?: Record<string, any>;
    // weight is optional as the backend can compute it
    weight?: number;
}

export interface RecommendationResponse {
    success: boolean;
    message: string;
}

export interface RecommendationState {
    loading: boolean;
    error: string | null;
    lastTracked: RecommendationSignal | null;
    profileSuggestions: ProfileSuggestion[];
    loadingSuggestions: boolean;
}

export interface ProfileSuggestion {
    id: string;
    user_id: string;
    full_name: string;
    headline: string;
    avatar_url: string | null;
    location: string | null;
    total_score: number;
    reasons: string[];
}
