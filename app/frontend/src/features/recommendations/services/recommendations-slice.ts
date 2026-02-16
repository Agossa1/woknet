import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RecommendationState } from './recommendations-types';
import { trackSignalThunk, fetchProfileSuggestionsThunk } from './recommendations-thunks';

const initialState: RecommendationState = {
    loading: false,
    error: null,
    lastTracked: null,
    profileSuggestions: [],
    loadingSuggestions: false,
};

const recommendationsSlice = createSlice({
    name: 'recommendations',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Track Signal
            .addCase(trackSignalThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(trackSignalThunk.fulfilled, (state, action) => {
                state.loading = false;
                // We update lastTracked just for debug/devtools visibility
                state.lastTracked = action.meta.arg;
            })
            .addCase(trackSignalThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Profile Suggestions
            .addCase(fetchProfileSuggestionsThunk.pending, (state) => {
                state.loadingSuggestions = true;
                state.error = null;
            })
            .addCase(fetchProfileSuggestionsThunk.fulfilled, (state, action) => {
                state.loadingSuggestions = false;
                state.profileSuggestions = action.payload;
            })
            .addCase(fetchProfileSuggestionsThunk.rejected, (state, action) => {
                state.loadingSuggestions = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = recommendationsSlice.actions;
export default recommendationsSlice.reducer;
