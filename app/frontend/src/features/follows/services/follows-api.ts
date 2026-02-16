import { api } from "../../api/apiClients";
import { FollowerInfo, FollowStatus, FollowCounts } from "./follows-types";

export const followsApi = {
    toggleFollow: async (followingId: string): Promise<FollowStatus> => {
        return api.post<FollowStatus>("/follows/toggle", { following_id: followingId });
    },

    checkStatus: async (profileId: string): Promise<FollowStatus> => {
        return api.get<FollowStatus>(`/follows/status/${profileId}`);
    },

    getFollowers: async (profileId: string): Promise<FollowerInfo[]> => {
        return api.get<FollowerInfo[]>(`/follows/followers/${profileId}`);
    },

    getFollowing: async (profileId: string): Promise<FollowerInfo[]> => {
        return api.get<FollowerInfo[]>(`/follows/following/${profileId}`);
    },

    getCounts: async (profileId: string): Promise<FollowCounts> => {
        return api.get<FollowCounts>(`/follows/counts/${profileId}`);
    }
};
