import { createAsyncThunk } from "@reduxjs/toolkit";
import { followsApi } from "./follows-api";

export const toggleFollowThunk = createAsyncThunk(
    "follows/toggle",
    async (followingId: string, { rejectWithValue }) => {
        try {
            return await followsApi.toggleFollow(followingId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to toggle follow");
        }
    }
);

export const checkFollowStatusThunk = createAsyncThunk(
    "follows/checkStatus",
    async (profileId: string, { rejectWithValue }) => {
        try {
            return await followsApi.checkStatus(profileId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to check status");
        }
    }
);

export const getFollowersThunk = createAsyncThunk(
    "follows/getFollowers",
    async (profileId: string, { rejectWithValue }) => {
        try {
            return await followsApi.getFollowers(profileId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to fetch followers");
        }
    }
);

export const getFollowingThunk = createAsyncThunk(
    "follows/getFollowing",
    async (profileId: string, { rejectWithValue }) => {
        try {
            return await followsApi.getFollowing(profileId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to fetch following");
        }
    }
);

export const getFollowCountsThunk = createAsyncThunk(
    "follows/getCounts",
    async (profileId: string, { rejectWithValue }) => {
        try {
            return await followsApi.getCounts(profileId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to fetch counts");
        }
    }
);
