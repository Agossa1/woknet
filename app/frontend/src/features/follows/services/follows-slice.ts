import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FollowerInfo, FollowCounts } from "./follows-types";
import {
    toggleFollowThunk,
    checkFollowStatusThunk,
    getFollowersThunk,
    getFollowingThunk,
    getFollowCountsThunk
} from "./follows-thunks";

interface FollowsState {
    followersByProfile: Record<string, FollowerInfo[]>;
    followingByProfile: Record<string, FollowerInfo[]>;
    countsByProfile: Record<string, FollowCounts>;
    isFollowingMap: Record<string, boolean>; // Map profileId to boolean status for current user
    loading: Record<string, boolean>;
    error: string | null;
}

const initialState: FollowsState = {
    followersByProfile: {},
    followingByProfile: {},
    countsByProfile: {},
    isFollowingMap: {},
    loading: {},
    error: null,
};

const followsSlice = createSlice({
    name: "follows",
    initialState,
    reducers: {
        updateFollowStatusRealtime: (state, action: PayloadAction<{ followerId: string, followingId: string, following: boolean, currentUserId?: string }>) => {
            const { followerId, followingId, following, currentUserId } = action.payload;

            // If current user is the follower, update isFollowingMap
            if (currentUserId === followerId) {
                state.isFollowingMap[followingId] = following;
            }

            // Update counts if profile is cached
            if (state.countsByProfile[followingId]) {
                state.countsByProfile[followingId].followers += following ? 1 : -1;
            }
            if (state.countsByProfile[followerId]) {
                state.countsByProfile[followerId].following += following ? 1 : -1;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(toggleFollowThunk.fulfilled, (state, action) => {
                const followingId = action.meta.arg;
                state.isFollowingMap[followingId] = action.payload.following;
            })
            .addCase(checkFollowStatusThunk.fulfilled, (state, action) => {
                const profileId = action.meta.arg;
                state.isFollowingMap[profileId] = action.payload.following;
            })
            .addCase(getFollowersThunk.fulfilled, (state, action) => {
                state.followersByProfile[action.meta.arg] = action.payload;
            })
            .addCase(getFollowingThunk.fulfilled, (state, action) => {
                state.followingByProfile[action.meta.arg] = action.payload;
            })
            .addCase(getFollowCountsThunk.fulfilled, (state, action) => {
                state.countsByProfile[action.meta.arg] = action.payload;
            });
    },
});

export const { updateFollowStatusRealtime } = followsSlice.actions;
export default followsSlice.reducer;
