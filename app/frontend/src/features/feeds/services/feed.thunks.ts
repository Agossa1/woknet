import { createAsyncThunk } from "@reduxjs/toolkit";
import { FeedService } from "./feed.api";


export const getFeedThunk = createAsyncThunk(
    "feed/getFeed",
    async ({ userId, page }: { userId: string, page?: number }, { rejectWithValue }) => {
        try {
            // Attention : Assure-toi que FeedService est bien instancié ou statique
            const response = await FeedService.getFeed(userId, page);
            return response.data; // On retourne le tableau de FeedItem
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Une erreur est survenue");
        }
    }
);