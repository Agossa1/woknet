import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FeedItem } from "./feed.types";
import { getFeedThunk } from "./feed.thunks";

interface FeedState {
    items: FeedItem[];
    loading: boolean;
    error: string | null;
}

const initialState: FeedState = {
    items: [],
    loading: false,
    error: null,
};

const feedSlice = createSlice({
    name: "feed",
    initialState,
    reducers: {
        // Pour vider le feed quand on change d'utilisateur par exemple
        resetFeed: (state) => {
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getFeedThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getFeedThunk.fulfilled, (state, action) => {
                state.loading = false;
                // On ajoute les nouveaux éléments (utile pour le scroll infini)
                state.items = [...state.items, ...action.payload];
            })
            .addCase(getFeedThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetFeed } = feedSlice.actions;
export default feedSlice.reducer;