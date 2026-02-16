import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiError } from "../../api/apiClients";
import { ProfileData, UpdateProfileDTO } from "./profile-types";
import { profileServices } from "./profile-api";

export const getProfileThunk = createAsyncThunk<{ user: ProfileData }, string>(
    "profiles/get-profile/:userId",
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await profileServices.getProfileUser(userId);
            return { user: response.data };
        } catch (error) {
            if (error instanceof ApiError) {
                return rejectWithValue(error.message || "Erreur lors de la récupération du profile");
            }
            return rejectWithValue("Échec de la récupération du profile");
        }
    }
);

export const getPublicProfileThunk = createAsyncThunk<{ user: ProfileData }, string>(
    "profiles/get-public-profile/:userId",
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await profileServices.getProfileUser(userId);
            return { user: response.data };
        } catch (error) {
            if (error instanceof ApiError) {
                return rejectWithValue(error.message || "Erreur lors de la récupération du profile public");
            }
            return rejectWithValue("Échec de la récupération du profile public");
        }
    }
);

export const updateProfileThunk = createAsyncThunk<{ user: ProfileData }, UpdateProfileDTO>(
    "profiles/update-profile/:userId",
    async (dto: UpdateProfileDTO, { rejectWithValue }) => {
        try {
            const response = await profileServices.updateProfileUser(dto.user_id, dto);
            return { user: response.data };
        } catch (error) {
            if (error instanceof ApiError) {
                // Si on a des erreurs de validation détaillées (Zod issues)
                if (error.data?.errors && Array.isArray(error.data.errors)) {
                    const validationErrors = error.data.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
                    return rejectWithValue(`Erreur de validation: ${validationErrors}`);
                }
                return rejectWithValue(error.message || "Erreur lors de la mise à jour du profile");
            }
            return rejectWithValue("Échec de la mise à jour du profile");
        }
    }
);



