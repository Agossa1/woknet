export enum RecommendationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    HIDDEN = 'HIDDEN'
}

export interface UserRecommendation {
    id: string;
    giver_id: string;
    receiver_id: string;
    content: string;
    relationship?: string;
    status: RecommendationStatus;
    created_at: Date;
    updated_at: Date;
}

export interface CreateRecommendationDTO {
    receiver_id: string;
    content: string;
    relationship?: string;
}

export interface UpdateRecommendationStatusDTO {
    status: RecommendationStatus;
}
