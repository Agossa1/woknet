import { createAsyncThunk } from "@reduxjs/toolkit";
import { experienceServices } from "./experience-api";
import { CreateExperienceDTO, UpdateExperienceDTO } from "./experience-types";

export const getExperienceByIdThunk = createAsyncThunk(
    "experiences/getById",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await experienceServices.getExperienceById(id);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch experience");
        }
    }
);

export const getExperiencesByProfileIdThunk = createAsyncThunk(
    "experiences/getByProfileId",
    async (profileId: string, { rejectWithValue }) => {
        try {
            const response = await experienceServices.getExperiencesByProfileId(profileId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch experiences");
        }
    }
);

export const createExperienceThunk = createAsyncThunk(
    "experiences/create",
    async (dto: CreateExperienceDTO, { rejectWithValue }) => {
        try {
            const response = await experienceServices.createExperience(dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to create experience");
        }
    }
);

export const updateExperienceThunk = createAsyncThunk(
    "experiences/update",
    async ({ id, dto }: { id: string; dto: UpdateExperienceDTO }, { rejectWithValue }) => {
        try {
            const response = await experienceServices.updateExperience(id, dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to update experience");
        }
    }
);

export const deleteExperienceThunk = createAsyncThunk(
    "experiences/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            await experienceServices.deleteExperience(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete experience");
        }
    }
);
