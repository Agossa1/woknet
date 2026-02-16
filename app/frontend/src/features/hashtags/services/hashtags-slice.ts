import { createSlice } from '@reduxjs/toolkit';
import { TrendingHashtag, Hashtag } from './hashtags-api';
import { fetchTrendingHashtagsThunk, searchHashtagsThunk, fetchPostsByHashtagThunk } from './hashtags-thunks';

interface HashtagState {
    trending: TrendingHashtag[];
    searchResults: Hashtag[];
    posts: any[];
    loading: boolean;
    loadingPosts: boolean;
    error: string | null;
}

const initialState: HashtagState = {
    trending: [],
    searchResults: [],
    posts: [],
    loading: false,
    loadingPosts: false,
    error: null,
};

const hashtagsSlice = createSlice({
    name: 'hashtags',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Trending
            .addCase(fetchTrendingHashtagsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTrendingHashtagsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.trending = action.payload;
            })
            .addCase(fetchTrendingHashtagsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Search
            .addCase(searchHashtagsThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(searchHashtagsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = action.payload;
            })
            .addCase(searchHashtagsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Posts
            .addCase(fetchPostsByHashtagThunk.pending, (state) => {
                state.loadingPosts = true;
                state.error = null;
            })
            .addCase(fetchPostsByHashtagThunk.fulfilled, (state, action) => {
                state.loadingPosts = false;
                state.posts = action.payload;
            })
            .addCase(fetchPostsByHashtagThunk.rejected, (state, action) => {
                state.loadingPosts = false;
                state.error = action.payload as string;
            });
    },
});

export default hashtagsSlice.reducer;
