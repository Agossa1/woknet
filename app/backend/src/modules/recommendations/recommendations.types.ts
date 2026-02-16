export type UserSignal = {
    id?: string;
    user_id: string;
    item_id: string;
    item_type: 'POST' | 'JOB' | 'USER' | 'COMPANY' | 'SKILL' | 'COMMUNITY';
    action_type: 'VIEW' | 'CLICK' | 'LIKE' | 'COMMENT' | 'SHARE' | 'SAVE' | 'DISMISS' | 'SEARCH' | 'APPLY' | 'CONNECT';
    metadata?: Record<string, any>;
    weight?: number;
    created_at?: Date;
};

export type CreateSignalDTO = Omit<UserSignal, 'id' | 'created_at'>;
