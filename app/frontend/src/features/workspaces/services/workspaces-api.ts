import { api } from "../../api/apiClients";
import {
    Workspace,
    CreateWorkspaceDTO,
    WPProject,
    CreateProjectDTO,
    WPTask,
    CreateTaskDTO,
    UpdateTaskDTO,
    WPStatus
} from "./workspaces-types";

export interface WorkspaceResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const workspacesApi = {
    // --- Workspaces ---
    getMyWorkspaces: () =>
        api.get<WorkspaceResponse<Workspace[]>>("/workspaces"),

    createWorkspace: (dto: CreateWorkspaceDTO) =>
        api.post<WorkspaceResponse<Workspace>>("/workspaces", dto),

    // --- Projects ---
    getProjects: (workspaceId: string) =>
        api.get<WorkspaceResponse<WPProject[]>>(`/workspaces/${workspaceId}/projects`),

    createProject: (workspaceId: string, dto: CreateProjectDTO) =>
        api.post<WorkspaceResponse<WPProject>>(`/workspaces/${workspaceId}/projects`, dto),

    getWorkspaceMembers: (workspaceId: string) =>
        api.get<WorkspaceResponse<any[]>>(`/workspaces/${workspaceId}/members`),

    // --- Tasks & Board ---
    getProjectBoard: (projectId: string) =>
        api.get<WorkspaceResponse<{ project: WPProject, statuses: WPStatus[], tasks: WPTask[] }>>(`/workspaces/projects/${projectId}/board`),

    createTask: (projectId: string, dto: CreateTaskDTO) =>
        api.post<WorkspaceResponse<WPTask>>(`/workspaces/projects/${projectId}/tasks`, dto),

    updateTaskStatus: (taskId: string, statusId: string) =>
        api.patch<WorkspaceResponse<void>>(`/workspaces/tasks/${taskId}/status`, { status_id: statusId }),

    getTask: (taskId: string) =>
        api.get<WorkspaceResponse<WPTask>>(`/workspaces/tasks/${taskId}`),

    updateTask: (taskId: string, dto: Partial<UpdateTaskDTO>) =>
        api.patch<WorkspaceResponse<WPTask>>(`/workspaces/tasks/${taskId}`, dto),

    getComments: (taskId: string) =>
        api.get<WorkspaceResponse<any[]>>(`/workspaces/tasks/${taskId}/comments`),

    addComment: (taskId: string, content: string) =>
        api.post<WorkspaceResponse<any>>(`/workspaces/tasks/${taskId}/comments`, { content }),

    getProjectTags: (projectId: string) =>
        api.get<WorkspaceResponse<any[]>>(`/workspaces/projects/${projectId}/tags`),

    createTag: (projectId: string, name: string, color: string) =>
        api.post<WorkspaceResponse<any>>(`/workspaces/projects/${projectId}/tags`, { name, color }),

    getCategories: (projectId: string) =>
        api.get<WorkspaceResponse<any[]>>(`/workspaces/projects/${projectId}/categories`),

    createCategory: (projectId: string, name: string, color: string, description?: string) =>
        api.post<WorkspaceResponse<any>>(`/workspaces/projects/${projectId}/categories`, { name, color, description }),

    addTagToTask: (taskId: string, tagId: string) =>
        api.post<WorkspaceResponse<void>>(`/workspaces/tasks/${taskId}/tags/${tagId}`, {}),

    removeTagFromTask: (taskId: string, tagId: string) =>
        api.delete<WorkspaceResponse<void>>(`/workspaces/tasks/${taskId}/tags/${tagId}`),

    getChecklist: (taskId: string) =>
        api.get<WorkspaceResponse<any[]>>(`/workspaces/tasks/${taskId}/checklist`),

    addChecklistItem: (taskId: string, title: string) =>
        api.post<WorkspaceResponse<any>>(`/workspaces/tasks/${taskId}/checklist`, { title }),

    updateChecklistItem: (itemId: string, dto: any) =>
        api.patch<WorkspaceResponse<any>>(`/workspaces/checklist/${itemId}`, dto),

    deleteChecklistItem: (itemId: string) =>
        api.delete<WorkspaceResponse<void>>(`/workspaces/checklist/${itemId}`),

    getAttachments: (taskId: string) =>
        api.get<WorkspaceResponse<any[]>>(`/workspaces/tasks/${taskId}/attachments`),

    addAttachment: (taskId: string, fileData: any) =>
        api.post<WorkspaceResponse<any>>(`/workspaces/tasks/${taskId}/attachments`, fileData),

    uploadTaskAttachment: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'task');
        return api.post<WorkspaceResponse<{ url: string }>>('/uploads/task-attachment', formData);
    }
};
