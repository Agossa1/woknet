export interface FollowerInfo {
    user_id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    headline?: string;
    is_following: boolean;
}

export interface FollowStatus {
    following: boolean;
}

export interface FollowCounts {
    followers: number;
    following: number;
}
