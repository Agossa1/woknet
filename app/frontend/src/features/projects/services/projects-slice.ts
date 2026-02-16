import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Project } from "./projects-types";
import { getProjectsThunk, createProjectThunk, updateProjectThunk, deleteProjectThunk } from "./projects-thunks";

interface ProjectsState {
    projects: Project[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ProjectsState = {
    projects: [],
    isLoading: false,
    error: null,
};

const projectsSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {
        clearProjectsError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // GET PROJECTS
        builder.addCase(getProjectsThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getProjectsThunk.fulfilled, (state, action: PayloadAction<Project[]>) => {
            state.isLoading = false;
            state.projects = action.payload;
        });
        builder.addCase(getProjectsThunk.rejected, (state, action: any) => {
            state.isLoading = false;
            state.error = action.payload || "Erreur inconnue";
        });

        // CREATE PROJECT
        builder.addCase(createProjectThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(createProjectThunk.fulfilled, (state, action: PayloadAction<Project>) => {
            state.isLoading = false;
            state.projects.unshift(action.payload); // Add to the beginning
        });
        builder.addCase(createProjectThunk.rejected, (state, action: any) => {
            state.isLoading = false;
            state.error = action.payload || "Erreur création";
        });

        // UPDATE PROJECT
        builder.addCase(updateProjectThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(updateProjectThunk.fulfilled, (state, action: PayloadAction<Project>) => {
            state.isLoading = false;
            const index = state.projects.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.projects[index] = action.payload;
            }
        });
        builder.addCase(updateProjectThunk.rejected, (state, action: any) => {
            state.isLoading = false;
            state.error = action.payload || "Erreur mise à jour";
        });

        // DELETE PROJECT
        builder.addCase(deleteProjectThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(deleteProjectThunk.fulfilled, (state, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.projects = state.projects.filter(p => p.id !== action.payload);
        });
        builder.addCase(deleteProjectThunk.rejected, (state, action: any) => {
            state.isLoading = false;
            state.error = action.payload || "Erreur suppression";
        });
    },
});

export const { clearProjectsError } = projectsSlice.actions;
export default projectsSlice.reducer;
