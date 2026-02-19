import { createAsyncThunk } from "@reduxjs/toolkit";
import { feedApi } from "./feed.api";

export const fetchPowerFeedThunk = createAsyncThunk(
    "feed/fetchPowerFeed",
    async ({ page }: { page?: number } = {}, { rejectWithValue }) => {
        try {
            const currentPage = page ?? 1;
            const result = await feedApi.getFeed(currentPage);
            return { ...result, page: currentPage };
        } catch (error: any) {
            return rejectWithValue(error.userMessage || error.message || "Failed to fetch power feed");
        }
    }
);
