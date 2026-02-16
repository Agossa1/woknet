import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ExperienceState, Experience } from "./experience-types";
import {
    getExperiencesByProfileIdThunk,
    createExperienceThunk,
    updateExperienceThunk,
    deleteExperienceThunk
} from "./experience-thunks";

const initialState: ExperienceState = {
    experiences: [],
    isLoading: false,
    error: null
};

const experienceSlice = createSlice({
    name: "experiences",
    initialState,
    reducers: {
        resetExperienceError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Get all experiences
        builder.addCase(getExperiencesByProfileIdThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getExperiencesByProfileIdThunk.fulfilled, (state, action: PayloadAction<Experience[]>) => {
            state.isLoading = false;
            state.experiences = action.payload;
        });
        builder.addCase(getExperiencesByProfileIdThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Create experience
        builder.addCase(createExperienceThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(createExperienceThunk.fulfilled, (state, action: PayloadAction<Experience>) => {
            state.isLoading = false;
            state.experiences.unshift(action.payload);
        });
        builder.addCase(createExperienceThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Update experience
        builder.addCase(updateExperienceThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(updateExperienceThunk.fulfilled, (state, action: PayloadAction<Experience>) => {
            state.isLoading = false;
            const index = state.experiences.findIndex(e => e.id === action.payload.id);
            if (index !== -1) {
                state.experiences[index] = action.payload;
            }
        });
        builder.addCase(updateExperienceThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Delete experience
        builder.addCase(deleteExperienceThunk.fulfilled, (state, action: PayloadAction<string>) => {
            state.experiences = state.experiences.filter(e => e.id !== action.payload);
        });
    }
});

export const { resetExperienceError } = experienceSlice.actions;
export default experienceSlice.reducer;
