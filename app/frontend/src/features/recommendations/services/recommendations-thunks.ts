import { createAsyncThunk } from '@reduxjs/toolkit';
import { recommendationsApi } from './recommendations-api';
import { RecommendationSignal, RecommendationResponse, ProfileSuggestion } from './recommendations-types';

export const trackSignalThunk = createAsyncThunk<RecommendationResponse, RecommendationSignal>(
    'recommendations/track',
    async (signal, { rejectWithValue }) => {
        try {
            return await recommendationsApi.trackSignal(signal);
        } catch (error: any) {
            // Tracking errors should probably be silent in the UI, but we log them
            console.warn("Recommendation tracking failed:", error);
            return rejectWithValue(error.response?.data?.message || error.message || 'Signal tracking failed');
        }
    }
);

export const fetchProfileSuggestionsThunk = createAsyncThunk<ProfileSuggestion[], number | undefined>(
    'recommendations/fetchProfiles',
    async (limit = 10, { rejectWithValue }) => {
        try {
            return await recommendationsApi.getProfileSuggestions(limit);
        } catch (error: any) {
            console.error("Failed to fetch profile suggestions:", error);
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch suggestions');
        }
    }
);

export const fetchJobRecommendationsThunk = createAsyncThunk<any[], number | undefined>(
    'recommendations/fetchJobs',
    async (limit = 10, { rejectWithValue }) => {
        try {
            return await recommendationsApi.getJobSuggestions(limit);
        } catch (error: any) {
            console.error("Failed to fetch job recommendations:", error);
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch job recommendations');
        }
    }
);
