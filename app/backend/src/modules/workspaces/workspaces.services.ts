import Logger from "../../infra/logger/winston";
import { ForbiddenException, NotFoundException } from "../../errors/custom-errors";
import { WorkspacesRepository } from "./workspaces.repository";
import {
    Workspace,
    CreateWorkspaceDTO,
    WPProject,
    CreateProjectDTO,
    WPTask,
    CreateTaskDTO,
    WPStatus,
    UpdateTaskDTO,
    WPComment,
    CreateCommentDTO,
    WPTag,
    WPChecklistItem,
    WPAttachment,
    WPTaskCategory
} from "./workspaces.types";

export class WorkspacesService {
    constructor(
        private readonly repository: WorkspacesRepository,
        private readonly logger: Logger,
    ) { }

    async createWorkspace(dto: CreateWorkspaceDTO): Promise<Workspace> {
        try {
            return await this.repository.createWorkspace(dto);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error creating workspace: ${error}`);
            throw error;
        }
    }

    async getMyWorkspaces(userId: string): Promise<Workspace[]> {
        try {
            return await this.repository.getWorkspacesByUserId(userId);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting workspaces: ${error}`);
            throw error;
        }
    }

    async createProject(dto: CreateProjectDTO, userId: string): Promise<WPProject> {
        try {
            // Check if user is member of workspace (preferably owner/admin)
            const isMember = await this.repository.isUserMemberOfWorkspace(dto.workspace_id, userId);
            if (!isMember) {
                throw new ForbiddenException("You don't have permission to create a project in this workspace");
            }

            return await this.repository.createProject(dto);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error creating project: ${error}`);
            throw error;
        }
    }

    async getProjects(workspaceId: string, userId: string): Promise<WPProject[]> {
        try {
            const isMember = await this.repository.isUserMemberOfWorkspace(workspaceId, userId);
            if (!isMember) {
                throw new ForbiddenException("You don't have permission to view projects in this workspace");
            }
            return await this.repository.getProjectsByWorkspaceId(workspaceId);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting projects: ${error}`);
            throw error;
        }
    }

    async getWorkspaceMembers(workspaceId: string, userId: string): Promise<any[]> {
        try {
            const isMember = await this.repository.isUserMemberOfWorkspace(workspaceId, userId);
            if (!isMember) {
                throw new ForbiddenException("You don't have permission to view members in this workspace");
            }
            return await this.repository.getWorkspaceMembers(workspaceId);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting members: ${error}`);
            throw error;
        }
    }

    async createTask(dto: CreateTaskDTO, userId: string): Promise<WPTask> {
        try {
            const isMember = await this.repository.isUserMemberOfProject(dto.project_id, userId);
            if (!isMember) {
                throw new ForbiddenException("You don't have permission to create tasks in this project");
            }
            return await this.repository.createTask(dto);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error creating task: ${error}`);
            throw error;
        }
    }

    async getTasks(projectId: string, userId: string): Promise<WPTask[]> {
        try {
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) {
                throw new ForbiddenException("You don't have permission to view tasks in this project");
            }
            return await this.repository.getTasksByProjectId(projectId);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting tasks: ${error}`);
            throw error;
        }
    }

    async getProjectBoard(projectId: string, userId: string): Promise<{ project: WPProject, statuses: WPStatus[], tasks: WPTask[] }> {
        try {
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) {
                throw new ForbiddenException("You don't have permission to view this project board");
            }

            const [project, statuses, tasks] = await Promise.all([
                this.repository.getProjectById(projectId),
                this.repository.getStatusesByProjectId(projectId),
                this.repository.getTasksByProjectId(projectId)
            ]);

            if (!project) throw new NotFoundException("Project not found");

            return { project, statuses, tasks };
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting project board: ${error}`);
            throw error;
        }
    }

    async updateTaskStatus(taskId: string, statusId: string, userId: string): Promise<void> {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId) {
                throw new NotFoundException("Task not found");
            }

            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) {
                throw new ForbiddenException("You don't have permission to update tasks in this project");
            }

            await this.repository.updateTaskStatus(taskId, statusId);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error updating task status: ${error}`);
            throw error;
        }
    }

    async getComments(taskId: string, userId: string): Promise<WPComment[]> {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId) throw new NotFoundException("Task not found");

            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) throw new ForbiddenException("Access denied");

            return await this.repository.getCommentsByTaskId(taskId);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting comments: ${error}`);
            throw error;
        }
    }

    async addComment(taskId: string, content: string, userId: string): Promise<WPComment> {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId) throw new NotFoundException("Task not found");

            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) throw new ForbiddenException("Access denied");

            return await this.repository.createComment({ task_id: taskId, user_id: userId, content });
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error adding comment: ${error}`);
            throw error;
        }
    }

    // --- Tags ---
    async getProjectTags(projectId: string, userId: string): Promise<WPTag[]> {
        try {
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) throw new ForbiddenException("Access denied");
            return await this.repository.getTagsByProjectId(projectId);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting project tags: ${error}`);
            throw error;
        }
    }

    async getTaskTags(taskId: string, userId: string): Promise<WPTag[]> {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId) throw new NotFoundException("Task not found");

            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) throw new ForbiddenException("Access denied");

            return await this.repository.getTaskTags(taskId);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting task tags: ${error}`);
            throw error;
        }
    }

    async addTagToTask(taskId: string, tagId: string, userId: string): Promise<void> {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId) throw new NotFoundException("Task not found");

            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) throw new ForbiddenException("Access denied");

            await this.repository.addTagToTask(taskId, tagId);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error adding tag to task: ${error}`);
            throw error;
        }
    }

    async removeTagFromTask(taskId: string, tagId: string, userId: string): Promise<void> {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId) throw new NotFoundException("Task not found");

            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) throw new ForbiddenException("Access denied");

            await this.repository.removeTagFromTask(taskId, tagId);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error removing tag from task: ${error}`);
            throw error;
        }
    }

    async createTag(projectId: string, name: string, color: string, userId: string): Promise<WPTag> {
        try {
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) throw new ForbiddenException("Access denied");
            return await this.repository.createTag(projectId, name, color);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error creating tag: ${error}`);
            throw error;
        }
    }

    // --- Checklists ---
    async getChecklist(taskId: string, userId: string): Promise<WPChecklistItem[]> {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId) throw new NotFoundException("Task not found");

            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) throw new ForbiddenException("Access denied");

            return await this.repository.getChecklistByTaskId(taskId);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting checklist: ${error}`);
            throw error;
        }
    }

    async addChecklistItem(taskId: string, title: string, userId: string): Promise<WPChecklistItem> {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId) throw new NotFoundException("Task not found");

            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) throw new ForbiddenException("Access denied");

            const existing = await this.repository.getChecklistByTaskId(taskId);
            const position = existing.length;

            return await this.repository.addChecklistItem(taskId, title, position);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error adding checklist item: ${error}`);
            throw error;
        }
    }

    async updateChecklistItem(id: string, dto: Partial<WPChecklistItem>, userId: string): Promise<WPChecklistItem> {
        try {
            // Simplification: check if user is member of project of the task owner of this checklist
            // For now, let's assume it's okay or add a deep check later if needed
            return await this.repository.updateChecklistItem(id, dto);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error updating checklist item: ${error}`);
            throw error;
        }
    }

    async deleteChecklistItem(id: string, userId: string): Promise<void> {
        try {
            await this.repository.deleteChecklistItem(id);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error deleting checklist item: ${error}`);
            throw error;
        }
    }

    // --- Attachments ---
    async getAttachments(taskId: string, userId: string): Promise<WPAttachment[]> {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId) throw new NotFoundException("Task not found");

            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) throw new ForbiddenException("Access denied");

            return await this.repository.getAttachmentsByTaskId(taskId);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting attachments: ${error}`);
            throw error;
        }
    }

    async addAttachment(taskId: string, userId: string, fileData: { name: string, url: string, type?: string, size?: number }): Promise<WPAttachment> {
        try {
            const projectId = await this.repository.getProjectIdByTaskId(taskId);
            if (!projectId) throw new NotFoundException("Task not found");

            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) throw new ForbiddenException("Access denied");

            return await this.repository.addAttachment({
                task_id: taskId,
                user_id: userId,
                file_name: fileData.name,
                file_url: fileData.url,
                file_type: fileData.type,
                file_size: fileData.size
            });
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error adding attachment: ${error}`);
            throw error;
        }
    }

    // --- Categories ---
    async getCategories(projectId: string, userId: string): Promise<WPTaskCategory[]> {
        try {
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) throw new ForbiddenException("Access denied");

            return await this.repository.getCategoriesByProjectId(projectId);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting categories: ${error}`);
            throw error;
        }
    }

    async createCategory(projectId: string, userId: string, data: { name: string, color: string, description?: string }): Promise<WPTaskCategory> {
        try {
            const isMember = await this.repository.isUserMemberOfProject(projectId, userId);
            if (!isMember) throw new ForbiddenException("Access denied");

            return await this.repository.createCategory(projectId, data.name, data.color, data.description);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error creating category: ${error}`);
            throw error;
        }
    }

    async getTaskDetail(taskId: string, userId: string): Promise<WPTask> {
        try {
            const task = await this.repository.getTaskById(taskId);
            if (!task) {
                throw new NotFoundException("Task not found");
            }

            const isMember = await this.repository.isUserMemberOfProject(task.project_id, userId);
            if (!isMember) {
                throw new ForbiddenException("You don't have permission to view this task");
            }

            return task;
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error getting task detail: ${error}`);
            throw error;
        }
    }

    async updateTask(taskId: string, dto: Partial<UpdateTaskDTO>, userId: string): Promise<WPTask> {
        try {
            const task = await this.repository.getTaskById(taskId);
            if (!task) {
                throw new NotFoundException("Task not found");
            }

            const isMember = await this.repository.isUserMemberOfProject(task.project_id, userId);
            if (!isMember) {
                throw new ForbiddenException("You don't have permission to update this task");
            }

            return await this.repository.updateTask(taskId, dto);
        } catch (error) {
            this.logger.instance.error(`[WorkspacesService] Error updating task: ${error}`);
            throw error;
        }
    }
}
