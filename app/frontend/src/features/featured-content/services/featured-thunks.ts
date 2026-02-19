import { createAsyncThunk } from "@reduxjs/toolkit";
import { featuredApi } from "./featured-api";
import { CreateFeaturedContentDTO, UpdateFeaturedContentDTO } from "./featured-types";

export const getProfileFeaturedThunk = createAsyncThunk(
    "featured/getProfile",
    async (profileId: string) => {
        return await featuredApi.getProfileFeatured(profileId);
    }
);

export const addFeaturedThunk = createAsyncThunk(
    "featured/add",
    async (dto: CreateFeaturedContentDTO) => {
        return await featuredApi.add(dto);
    }
);

export const updateFeaturedThunk = createAsyncThunk(
    "featured/update",
    async ({ id, dto }: { id: string; dto: UpdateFeaturedContentDTO }) => {
        return await featuredApi.update(id, dto);
    }
);

export const deleteFeaturedThunk = createAsyncThunk(
    "featured/delete",
    async (id: string) => {
        await featuredApi.remove(id);
        return id;
    }
);
