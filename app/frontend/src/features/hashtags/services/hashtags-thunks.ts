import { createAsyncThunk } from '@reduxjs/toolkit';
import { hashtagsApi, TrendingHashtag, Hashtag } from './hashtags-api';

export const fetchTrendingHashtagsThunk = createAsyncThunk<TrendingHashtag[], number | undefined>(
    'hashtags/fetchTrending',
    async (limit = 10, { rejectWithValue }) => {
        try {
            return await hashtagsApi.getTrending(limit);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch trending hashtags');
        }
    }
);

export const searchHashtagsThunk = createAsyncThunk<Hashtag[], { query: string; limit?: number }>(
    'hashtags/search',
    async ({ query, limit = 20 }, { rejectWithValue }) => {
        try {
            return await hashtagsApi.search(query, limit);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to search hashtags');
        }
    }
);

export const fetchPostsByHashtagThunk = createAsyncThunk<any[], { name: string; limit?: number; offset?: number }>(
    'hashtags/fetchPosts',
    async ({ name, limit = 20, offset = 0 }, { rejectWithValue }) => {
        try {
            return await hashtagsApi.getPostsByHashtag(name, limit, offset);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch posts for hashtag');
        }
    }
);
