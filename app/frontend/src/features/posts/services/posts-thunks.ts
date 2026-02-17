import { createAsyncThunk } from "@reduxjs/toolkit";
import { postsApi } from "./posts-api";
import { CreatePostDTO, UpdatePostDTO } from "./posts-types";

export const fetchFeedThunk = createAsyncThunk(
    "posts/fetchFeed",
    async ({ page, limit }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
        try {
            return await postsApi.getFeed(page, limit);
        } catch (error: any) {
            return rejectWithValue(error.userMessage || error.message || "Failed to fetch feed");
        }
    }
);

export const fetchProfilePostsThunk = createAsyncThunk(
    "posts/fetchProfilePosts",
    async (profileId: string, { rejectWithValue }) => {
        try {
            return { profileId, posts: await postsApi.getProfilePosts(profileId) };
        } catch (error: any) {
            return rejectWithValue(error.userMessage || error.message || "Failed to fetch profile posts");
        }
    }
);

export const fetchCompanyPostsThunk = createAsyncThunk(
    "posts/fetchCompanyPosts",
    async (companyId: string, { rejectWithValue }) => {
        try {
            return { companyId, posts: await postsApi.getCompanyPosts(companyId) };
        } catch (error: any) {
            return rejectWithValue(error.userMessage || error.message || "Failed to fetch company posts");
        }
    }
);

export const createPostThunk = createAsyncThunk(
    "posts/createPost",
    async ({ dto, onProgress }: { dto: CreatePostDTO; onProgress?: (ev: ProgressEvent) => void }, { rejectWithValue }) => {
        try {
            return await postsApi.createPost(dto, onProgress);
        } catch (error: any) {
            return rejectWithValue(error.userMessage || error.message || "Failed to create post");
        }
    }
);

export const toggleLikeThunk = createAsyncThunk(
    "posts/toggleLike",
    async ({ postId, profileId, reactionType }: { postId: string; profileId: string; reactionType?: string }, { rejectWithValue }) => {
        try {
            const result = await postsApi.toggleLike(postId, profileId, reactionType);
            return { postId, liked: result.liked, reactionType: reactionType || 'LIKE' };
        } catch (error: any) {
            return rejectWithValue(error.userMessage || error.message || "Failed to toggle like");
        }
    }
);

export const deletePostThunk = createAsyncThunk(
    "posts/deletePost",
    async (postId: string, { rejectWithValue }) => {
        try {
            await postsApi.deletePost(postId);
            return postId;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || error.message || "Failed to delete post");
        }
    }
);

export const updatePostThunk = createAsyncThunk(
    "posts/updatePost",
    async ({ dto, onProgress }: { dto: UpdatePostDTO; onProgress?: (ev: ProgressEvent) => void }, { rejectWithValue }) => {
        try {
            return await postsApi.updatePost(dto, onProgress);
        } catch (error: any) {
            return rejectWithValue(error.userMessage || error.message || "Failed to update post");
        }
    }
);

export const toggleSavePostThunk = createAsyncThunk(
    "posts/toggleSavePost",
    async (postId: string, { rejectWithValue }) => {
        try {
            const result = await postsApi.toggleSavePost(postId);
            return { postId, saved: result.saved };
        } catch (error: any) {
            return rejectWithValue(error.userMessage || error.message || "Failed to toggle save post");
        }
    }
);

export const fetchSavedPostsThunk = createAsyncThunk(
    "posts/fetchSavedPosts",
    async (_, { rejectWithValue }) => {
        try {
            return await postsApi.getSavedPosts();
        } catch (error: any) {
            return rejectWithValue(error.userMessage || error.message || "Failed to fetch saved posts");
        }
    }
);
