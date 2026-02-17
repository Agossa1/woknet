import { RootState } from "@/src/store/store";

export const selectWorkspaces = (state: RootState) => state.workspaces.workspaces;
export const selectCurrentWorkspace = (state: RootState) => state.workspaces.currentWorkspace;
export const selectWorkspaceProjects = (state: RootState) => state.workspaces.projects;
export const selectCurrentProject = (state: RootState) => state.workspaces.currentProject;
export const selectProjectBoard = (state: RootState) => state.workspaces.board;
export const selectWorkspacesLoading = (state: RootState) => state.workspaces.loading;
export const selectWorkspacesError = (state: RootState) => state.workspaces.error;
export const selectWorkspaceMembers = (state: RootState) => state.workspaces.members;
export const selectTaskComments = (state: RootState) => state.workspaces.taskComments;
export const selectProjectTags = (state: RootState) => state.workspaces.projectTags;
export const selectTaskTags = (state: RootState) => state.workspaces.taskTags;
export const selectTaskChecklist = (state: RootState) => state.workspaces.taskChecklist;
export const selectTaskAttachments = (state: RootState) => state.workspaces.taskAttachments;
export const selectProjectCategories = (state: RootState) => state.workspaces.projectCategories;
