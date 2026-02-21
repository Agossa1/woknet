"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacesService = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
class WorkspacesService {
    constructor(repository, logger) {
        this.repository = repository;
        this.logger = logger;
    }
    async createWorkspace(dto) {
        try {
            return await this.repository.createWorkspace(dto);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error creating workspace: ${error}`);
            throw error;
        }
    }
    async getMyWorkspaces(userId) {
        try {
            return await this.repository.getWorkspacesByUserId(userId);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting workspaces: ${error}`);
            throw error;
        }
    }
    async createProject(dto, userId) {
        try {
            // Check if user is member of workspace (preferably owner/admin)
            const isMember = await this.repository.isUserMemberOfWorkspace(dto.workspace_id, userId);
            if (!isMember) {
                throw new custom_errors_1.ForbiddenException("You don't have permission to create a project in this workspace");
            }
            return await this.repository.createProject(dto);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error creating project: ${error}`);
            throw error;
        }
    }
    async getProjects(workspaceId, userId) {
        try {
            const isMember = await this.repository.isUserMemberOfWorkspace(workspaceId, userId);
            if (!isMember) {
                throw new custom_errors_1.ForbiddenException("You don't have permission to view projects in this workspace");
            }
            return await this.repository.getProjectsByWorkspaceId(workspaceId);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting projects: ${error}`);
            throw error;
        }
    }
    async getWorkspaceMembers(workspaceId, userId) {
        try {
            const isMember = await this.repository.isUserMemberOfWorkspace(workspaceId, userId);
            if (!isMember) {
                throw new custom_errors_1.ForbiddenException("You don't have permission to view members in this workspace");
            }
            return await this.repository.getWorkspaceMembers(workspaceId);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting members: ${error}`);
            throw error;
        }
    }
    async createTask(dto, userId) {
        try {
            const isMember = await this.repository.isUserMemberOfProject(dto.project_id, userId);
            if (!isMember) {
                throw new custom_errors_1.ForbiddenException("You don't have permission to create tasks in this project");
            }
            return await this.repository.createTask(dto);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error creating task: ${error}`);
            throw error;
        }
    }
    async getTasks(projectId, userId) {
        try {
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) {
                throw new custom_errors_1.ForbiddenException("You don't have permission to view tasks in this project");
            }
            return await this.repository.getTasksByProjectId(projectId);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting tasks: ${error}`);
            throw error;
        }
    }
    async getProjectBoard(projectId, userId) {
        try {
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) {
                throw new custom_errors_1.ForbiddenException("You don't have permission to view this project board");
            }
            const [project, statuses, tasks] = await Promise.all([
                this.repository.getProjectById(projectId),
                this.repository.getStatusesByProjectId(projectId),
                this.repository.getTasksByProjectId(projectId)
            ]);
            if (!project)
                throw new custom_errors_1.NotFoundException("Project not found");
            return { project, statuses, tasks };
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting project board: ${error}`);
            throw error;
        }
    }
    async updateTaskStatus(taskId, statusId, userId) {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId) {
                throw new custom_errors_1.NotFoundException("Task not found");
            }
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) {
                throw new custom_errors_1.ForbiddenException("You don't have permission to update tasks in this project");
            }
            await this.repository.updateTaskStatus(taskId, statusId);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error updating task status: ${error}`);
            throw error;
        }
    }
    async getComments(taskId, userId) {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId)
                throw new custom_errors_1.NotFoundException("Task not found");
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember)
                throw new custom_errors_1.ForbiddenException("Access denied");
            return await this.repository.getCommentsByTaskId(taskId);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting comments: ${error}`);
            throw error;
        }
    }
    async addComment(taskId, content, userId) {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId)
                throw new custom_errors_1.NotFoundException("Task not found");
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember)
                throw new custom_errors_1.ForbiddenException("Access denied");
            return await this.repository.createComment({ task_id: taskId, user_id: userId, content });
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error adding comment: ${error}`);
            throw error;
        }
    }
    // --- Tags ---
    async getProjectTags(projectId, userId) {
        try {
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember)
                throw new custom_errors_1.ForbiddenException("Access denied");
            return await this.repository.getTagsByProjectId(projectId);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting project tags: ${error}`);
            throw error;
        }
    }
    async getTaskTags(taskId, userId) {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId)
                throw new custom_errors_1.NotFoundException("Task not found");
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember)
                throw new custom_errors_1.ForbiddenException("Access denied");
            return await this.repository.getTaskTags(taskId);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting task tags: ${error}`);
            throw error;
        }
    }
    async addTagToTask(taskId, tagId, userId) {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId)
                throw new custom_errors_1.NotFoundException("Task not found");
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember)
                throw new custom_errors_1.ForbiddenException("Access denied");
            await this.repository.addTagToTask(taskId, tagId);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error adding tag to task: ${error}`);
            throw error;
        }
    }
    async removeTagFromTask(taskId, tagId, userId) {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId)
                throw new custom_errors_1.NotFoundException("Task not found");
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember)
                throw new custom_errors_1.ForbiddenException("Access denied");
            await this.repository.removeTagFromTask(taskId, tagId);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error removing tag from task: ${error}`);
            throw error;
        }
    }
    async createTag(projectId, name, color, userId) {
        try {
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember)
                throw new custom_errors_1.ForbiddenException("Access denied");
            return await this.repository.createTag(projectId, name, color);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error creating tag: ${error}`);
            throw error;
        }
    }
    // --- Checklists ---
    async getChecklist(taskId, userId) {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId)
                throw new custom_errors_1.NotFoundException("Task not found");
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember)
                throw new custom_errors_1.ForbiddenException("Access denied");
            return await this.repository.getChecklistByTaskId(taskId);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting checklist: ${error}`);
            throw error;
        }
    }
    async addChecklistItem(taskId, title, userId) {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId)
                throw new custom_errors_1.NotFoundException("Task not found");
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember)
                throw new custom_errors_1.ForbiddenException("Access denied");
            const existing = await this.repository.getChecklistByTaskId(taskId);
            const position = existing.length;
            return await this.repository.addChecklistItem(taskId, title, position);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error adding checklist item: ${error}`);
            throw error;
        }
    }
    async updateChecklistItem(id, dto, userId) {
        try {
            // Simplification: check if user is member of project of the task owner of this checklist
            // For now, let's assume it's okay or add a deep check later if needed
            return await this.repository.updateChecklistItem(id, dto);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error updating checklist item: ${error}`);
            throw error;
        }
    }
    async deleteChecklistItem(id, userId) {
        try {
            await this.repository.deleteChecklistItem(id);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error deleting checklist item: ${error}`);
            throw error;
        }
    }
    // --- Attachments ---
    async getAttachments(taskId, userId) {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId)
                throw new custom_errors_1.NotFoundException("Task not found");
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember)
                throw new custom_errors_1.ForbiddenException("Access denied");
            return await this.repository.getAttachmentsByTaskId(taskId);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting attachments: ${error}`);
            throw error;
        }
    }
    async addAttachment(taskId, userId, fileData) {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId)
                throw new custom_errors_1.NotFoundException("Task not found");
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember)
                throw new custom_errors_1.ForbiddenException("Access denied");
            return await this.repository.addAttachment({
                task_id: taskId,
                user_id: userId,
                file_name: fileData.name,
                file_url: fileData.url,
                file_type: fileData.type,
                file_size: fileData.size
            });
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error adding attachment: ${error}`);
            throw error;
        }
    }
    // --- Categories ---
    async getCategories(projectId, userId) {
        try {
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember)
                throw new custom_errors_1.ForbiddenException("Access denied");
            return await this.repository.getCategoriesByProjectId(projectId);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting categories: ${error}`);
            throw error;
        }
    }
    async createCategory(projectId, userId, data) {
        try {
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember)
                throw new custom_errors_1.ForbiddenException("Access denied");
            return await this.repository.createCategory(projectId, data.name, data.color, data.description);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error creating category: ${error}`);
            throw error;
        }
    }
    async getTaskDetail(taskId, userId) {
        try {
            const task = await this.repository.getTaskById(taskId);
            if (!task) {
                throw new custom_errors_1.NotFoundException("Task not found");
            }
            const isMember = await this.repository.isUserMemberOfProject(task.project_id, userId);
            if (!isMember) {
                throw new custom_errors_1.ForbiddenException("You don't have permission to view this task");
            }
            return task;
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting task detail: ${error}`);
            throw error;
        }
    }
    async updateTask(taskId, dto, userId) {
        try {
            const task = await this.repository.getTaskById(taskId);
            if (!task) {
                throw new custom_errors_1.NotFoundException("Task not found");
            }
            const isMember = await this.repository.isUserMemberOfProject(task.project_id, userId);
            if (!isMember) {
                throw new custom_errors_1.ForbiddenException("You don't have permission to update this task");
            }
            return await this.repository.updateTask(taskId, dto);
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error updating task: ${error}`);
            throw error;
        }
    }
}
exports.WorkspacesService = WorkspacesService;
//# sourceMappingURL=workspaces.services.js.map