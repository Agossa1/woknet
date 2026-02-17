import { createAsyncThunk } from "@reduxjs/toolkit";
import { workspacesApi } from "./workspaces-api";
import {
    CreateWorkspaceDTO,
    CreateProjectDTO,
    CreateTaskDTO
} from "./workspaces-types";

export const getMyWorkspacesThunk = createAsyncThunk(
    "workspaces/getMyWorkspaces",
    async (_, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.getMyWorkspaces();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to fetch workspaces");
        }
    }
);

export const createWorkspaceThunk = createAsyncThunk(
    "workspaces/createWorkspace",
    async (dto: CreateWorkspaceDTO, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.createWorkspace(dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to create workspace");
        }
    }
);

export const getProjectsThunk = createAsyncThunk(
    "workspaces/getProjects",
    async (workspaceId: string, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.getProjects(workspaceId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to fetch projects");
        }
    }
);

export const getWorkspaceMembersThunk = createAsyncThunk(
    "workspaces/getWorkspaceMembers",
    async (workspaceId: string, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.getWorkspaceMembers(workspaceId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to fetch workspace members");
        }
    }
);

export const createProjectThunk = createAsyncThunk(
    "workspaces/createProject",
    async ({ workspaceId, dto }: { workspaceId: string, dto: CreateProjectDTO }, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.createProject(workspaceId, dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to create project");
        }
    }
);

export const getProjectBoardThunk = createAsyncThunk(
    "workspaces/getProjectBoard",
    async (projectId: string, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.getProjectBoard(projectId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to fetch project board");
        }
    }
);

export const createTaskThunk = createAsyncThunk(
    "workspaces/createTask",
    async ({ projectId, dto }: { projectId: string, dto: CreateTaskDTO }, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.createTask(projectId, dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to create task");
        }
    }
);

export const updateTaskStatusThunk = createAsyncThunk(
    "workspaces/updateTaskStatus",
    async ({ taskId, statusId }: { taskId: string, statusId: string }, { rejectWithValue }) => {
        try {
            await workspacesApi.updateTaskStatus(taskId, statusId);
            return { taskId, statusId };
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to update task status");
        }
    }
);

export const updateTaskThunk = createAsyncThunk(
    "workspaces/updateTask",
    async ({ taskId, dto }: { taskId: string, dto: any }, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.updateTask(taskId, dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to update task");
        }
    }
);

export const getCommentsThunk = createAsyncThunk(
    "workspaces/getComments",
    async (taskId: string, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.getComments(taskId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to fetch comments");
        }
    }
);

export const addCommentThunk = createAsyncThunk(
    "workspaces/addComment",
    async ({ taskId, content }: { taskId: string, content: string }, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.addComment(taskId, content);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to add comment");
        }
    }
);

export const getProjectTagsThunk = createAsyncThunk(
    "workspaces/getProjectTags",
    async (projectId: string, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.getProjectTags(projectId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to fetch tags");
        }
    }
);

export const createTagThunk = createAsyncThunk(
    "workspaces/createTag",
    async ({ projectId, name, color }: { projectId: string, name: string, color: string }, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.createTag(projectId, name, color);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to create tag");
        }
    }
);

export const getCategoriesThunk = createAsyncThunk(
    "workspaces/getCategories",
    async (projectId: string, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.getCategories(projectId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to fetch categories");
        }
    }
);

export const createCategoryThunk = createAsyncThunk(
    "workspaces/createCategory",
    async ({ projectId, name, color, description }: { projectId: string, name: string, color: string, description?: string }, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.createCategory(projectId, name, color, description);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to create category");
        }
    }
);

export const addTagToTaskThunk = createAsyncThunk(
    "workspaces/addTagToTask",
    async ({ taskId, tagId }: { taskId: string, tagId: string }, { rejectWithValue }) => {
        try {
            await workspacesApi.addTagToTask(taskId, tagId);
            return { taskId, tagId };
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to add tag");
        }
    }
);

export const removeTagFromTaskThunk = createAsyncThunk(
    "workspaces/removeTagFromTask",
    async ({ taskId, tagId }: { taskId: string, tagId: string }, { rejectWithValue }) => {
        try {
            await workspacesApi.removeTagFromTask(taskId, tagId);
            return { taskId, tagId };
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to remove tag");
        }
    }
);

export const getChecklistThunk = createAsyncThunk(
    "workspaces/getChecklist",
    async (taskId: string, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.getChecklist(taskId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to fetch checklist");
        }
    }
);

export const addChecklistItemThunk = createAsyncThunk(
    "workspaces/addChecklistItem",
    async ({ taskId, title }: { taskId: string, title: string }, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.addChecklistItem(taskId, title);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to add checklist item");
        }
    }
);

export const updateChecklistItemThunk = createAsyncThunk(
    "workspaces/updateChecklistItem",
    async ({ itemId, dto }: { itemId: string, dto: any }, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.updateChecklistItem(itemId, dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to update checklist item");
        }
    }
);

export const deleteChecklistItemThunk = createAsyncThunk(
    "workspaces/deleteChecklistItem",
    async (itemId: string, { rejectWithValue }) => {
        try {
            await workspacesApi.deleteChecklistItem(itemId);
            return itemId;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to delete checklist item");
        }
    }
);

export const getAttachmentsThunk = createAsyncThunk(
    "workspaces/getAttachments",
    async (taskId: string, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.getAttachments(taskId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to fetch attachments");
        }
    }
);

export const addAttachmentThunk = createAsyncThunk(
    "workspaces/addAttachment",
    async ({ taskId, fileData }: { taskId: string, fileData: any }, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.addAttachment(taskId, fileData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to add attachment");
        }
    }
);

export const uploadTaskAttachmentThunk = createAsyncThunk(
    "workspaces/uploadAttachment",
    async (file: File, { rejectWithValue }) => {
        try {
            const response = await workspacesApi.uploadTaskAttachment(file);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Failed to upload file");
        }
    }
);
