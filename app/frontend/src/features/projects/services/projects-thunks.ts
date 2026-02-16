import { createAsyncThunk } from "@reduxjs/toolkit";
import { CreateProjectDTO, Project, UpdateProjectDTO } from "./projects-types";
import { projectsApi } from "./projects-api";

// 1. Fetch Projects by Profile ID
export const getProjectsThunk = createAsyncThunk(
    "projects/getByProfile",
    async (profileId: string, { rejectWithValue }) => {
        try {
            const data = await projectsApi.getProjectsByProfileId(profileId);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Erreur lors du chargement des projets");
        }
    }
);

// 2. Create Project
export const createProjectThunk = createAsyncThunk(
    "projects/create",
    async (data: CreateProjectDTO, { rejectWithValue }) => {
        try {
            const result = await projectsApi.createProject(data);
            return result;
        } catch (error: any) {
            return rejectWithValue(error.message || "Erreur lors de la création du projet");
        }
    }
);

// 3. Update Project
export const updateProjectThunk = createAsyncThunk(
    "projects/update",
    async (data: UpdateProjectDTO, { rejectWithValue }) => {
        try {
            const result = await projectsApi.updateProject(data);
            return result;
        } catch (error: any) {
            return rejectWithValue(error.message || "Erreur lors de la mise à jour du projet");
        }
    }
);

// 4. Delete Project
export const deleteProjectThunk = createAsyncThunk(
    "projects/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            await projectsApi.deleteProject(id);
            return id; // Return ID to remove from state
        } catch (error: any) {
            return rejectWithValue(error.message || "Erreur lors de la suppression du projet");
        }
    }
);
