export interface Follow {
    follower_id: string;
    following_id: string;
    created_at: Date | string;
}

export interface FollowDTO {
    follower_id: string;
    following_id: string;
}

export interface FollowerInfo {
    user_id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    headline?: string;
    is_following: boolean; // Whether the current user is following this person
}
