import { RootState } from "@/src/store/store";

export const selectProjects = (state: RootState) => state.projects.projects;
export const selectProjectsLoading = (state: RootState) => state.projects.isLoading;
export const selectProjectsError = (state: RootState) => state.projects.error;
