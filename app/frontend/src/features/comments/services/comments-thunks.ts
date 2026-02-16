import { createAsyncThunk } from "@reduxjs/toolkit";
import { commentsApi } from "./comments-api";
import { CreateCommentDTO, UpdateCommentDTO } from "./comments-types";

export const fetchCommentsThunk = createAsyncThunk(
    "comments/fetchByPost",
    async (postId: string, { rejectWithValue }) => {
        try {
            return await commentsApi.getPostComments(postId);
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to fetch comments");
        }
    }
);

export const createCommentThunk = createAsyncThunk(
    "comments/create",
    async (dto: CreateCommentDTO, { rejectWithValue }) => {
        try {
            return await commentsApi.createComment(dto);
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to create comment");
        }
    }
);

export const toggleCommentLikeThunk = createAsyncThunk(
    "comments/toggleLike",
    async ({ commentId, profileId }: { commentId: string; profileId: string }, { rejectWithValue }) => {
        try {
            return await commentsApi.toggleCommentLike(commentId, profileId);
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to toggle like");
        }
    }
);

export const fetchRepliesThunk = createAsyncThunk(
    "comments/fetchReplies",
    async (parentId: string, { rejectWithValue }) => {
        try {
            return await commentsApi.getReplies(parentId);
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to fetch replies");
        }
    }
);
