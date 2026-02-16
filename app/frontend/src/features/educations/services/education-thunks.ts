import { createAsyncThunk } from "@reduxjs/toolkit";
import { educationServices } from "./education-api";
import { CreateEducationDTO, UpdateEducationDTO } from "./education-types";

// Get educations by profile ID
export const getEducationsByProfileIdThunk = createAsyncThunk(
    'educations/getByProfileId',
    async (profileId: string, { rejectWithValue }) => {
        try {
            const response = await educationServices.getEducationsByProfileId(profileId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch educations');
        }
    }
);

// Get education by ID
export const getEducationByIdThunk = createAsyncThunk(
    'educations/getById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await educationServices.getEducationById(id);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch education');
        }
    }
);

// Create education
export const createEducationThunk = createAsyncThunk(
    'educations/create',
    async (dto: CreateEducationDTO, { rejectWithValue }) => {
        try {
            const response = await educationServices.createEducation(dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create education');
        }
    }
);

// Update education
export const updateEducationThunk = createAsyncThunk(
    'educations/update',
    async ({ id, dto }: { id: string; dto: UpdateEducationDTO }, { rejectWithValue }) => {
        try {
            const response = await educationServices.updateEducation(id, dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update education');
        }
    }
);

// Delete education
export const deleteEducationThunk = createAsyncThunk(
    'educations/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await educationServices.deleteEducation(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete education');
        }
    }
);
