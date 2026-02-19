import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FeaturedContent } from "./featured-types";
import { addFeaturedThunk, deleteFeaturedThunk, getProfileFeaturedThunk, updateFeaturedThunk } from "./featured-thunks";
import { RootState } from "@/src/store/store";

interface FeaturedState {
    featured: FeaturedContent[];
    loading: boolean;
}

const initialState: FeaturedState = {
    featured: [],
    loading: false,
};

const featuredSlice = createSlice({
    name: "featured",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getProfileFeaturedThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(getProfileFeaturedThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.featured = action.payload;
            })
            .addCase(getProfileFeaturedThunk.rejected, (state) => {
                state.loading = false;
            })
            .addCase(addFeaturedThunk.fulfilled, (state, action) => {
                state.featured.unshift(action.payload);
            })
            .addCase(updateFeaturedThunk.fulfilled, (state, action) => {
                const index = state.featured.findIndex(f => f.id === action.payload.id);
                if (index !== -1) {
                    state.featured[index] = action.payload;
                }
            })
            .addCase(deleteFeaturedThunk.fulfilled, (state, action) => {
                state.featured = state.featured.filter(f => f.id !== action.payload);
            });
    },
});

export const selectFeaturedItems = (state: RootState) => state.featured.featured;
export const selectFeaturedLoading = (state: RootState) => state.featured.loading;

export default featuredSlice.reducer;
