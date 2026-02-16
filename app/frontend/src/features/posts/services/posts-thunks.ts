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
    async ({ postId, profileId }: { postId: string; profileId: string }, { rejectWithValue }) => {
        try {
            const result = await postsApi.toggleLike(postId, profileId);
            return { postId, liked: result.liked };
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
