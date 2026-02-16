import { createSlice } from "@reduxjs/toolkit";
import { EducationState } from "./education-types";
import {
    getEducationsByProfileIdThunk,
    getEducationByIdThunk,
    createEducationThunk,
    updateEducationThunk,
    deleteEducationThunk
} from "./education-thunks";

const initialState: EducationState = {
    educations: [],
    isLoading: false,
    error: null,
};

const educationSlice = createSlice({
    name: "educations",
    initialState,
    reducers: {
        clearEducations: (state) => {
            state.educations = [];
            state.error = null;
        },
        clearEducationError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Get educations by profile ID
        builder
            .addCase(getEducationsByProfileIdThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getEducationsByProfileIdThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.educations = action.payload;
            })
            .addCase(getEducationsByProfileIdThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Get education by ID
        builder
            .addCase(getEducationByIdThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getEducationByIdThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.educations.findIndex(edu => edu.id === action.payload.id);
                if (index !== -1) {
                    state.educations[index] = action.payload;
                } else {
                    state.educations.push(action.payload);
                }
            })
            .addCase(getEducationByIdThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Create education
        builder
            .addCase(createEducationThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createEducationThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.educations.push(action.payload);
            })
            .addCase(createEducationThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update education
        builder
            .addCase(updateEducationThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateEducationThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.educations.findIndex(edu => edu.id === action.payload.id);
                if (index !== -1) {
                    state.educations[index] = action.payload;
                }
            })
            .addCase(updateEducationThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete education
        builder
            .addCase(deleteEducationThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteEducationThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.educations = state.educations.filter(edu => edu.id !== action.payload);
            })
            .addCase(deleteEducationThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearEducations, clearEducationError } = educationSlice.actions;
export default educationSlice.reducer;
