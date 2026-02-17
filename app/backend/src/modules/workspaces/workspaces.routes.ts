import { Router } from "express";
import { WorkspacesController } from "./workspaces.controller";
import { AuthGuard } from "../../infra/middleware/auth.middleware";

export class WorkspacesRouter {
    private readonly router: Router;

    constructor(private readonly controller: WorkspacesController) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // --- Tasks & Board (Literal prefix /projects/) ---
        this.router.post('/projects/:projectId/tasks', AuthGuard.authenticate, this.controller.createTask);
        this.router.get('/projects/:projectId/board', AuthGuard.authenticate, this.controller.getProjectBoard);
        this.router.get('/projects/:projectId/tags', AuthGuard.authenticate, this.controller.getProjectTags);
        this.router.post('/projects/:projectId/tags', AuthGuard.authenticate, this.controller.createTag);
        this.router.get('/projects/:projectId/categories', AuthGuard.authenticate, this.controller.getCategories);
        this.router.post('/projects/:projectId/categories', AuthGuard.authenticate, this.controller.createCategory);
        this.router.get('/tasks/:taskId', AuthGuard.authenticate, this.controller.getTaskDetail);
        this.router.patch('/tasks/:taskId', AuthGuard.authenticate, this.controller.updateTask);
        this.router.patch('/tasks/:taskId/status', AuthGuard.authenticate, this.controller.updateTaskStatus);
        this.router.get('/tasks/:taskId/comments', AuthGuard.authenticate, this.controller.getComments);
        this.router.post('/tasks/:taskId/comments', AuthGuard.authenticate, this.controller.addComment);
        this.router.post('/tasks/:taskId/tags/:tagId', AuthGuard.authenticate, this.controller.addTagToTask);
        this.router.delete('/tasks/:taskId/tags/:tagId', AuthGuard.authenticate, this.controller.removeTagFromTask);
        this.router.get('/tasks/:taskId/checklist', AuthGuard.authenticate, this.controller.getChecklist);
        this.router.post('/tasks/:taskId/checklist', AuthGuard.authenticate, this.controller.addChecklistItem);
        this.router.patch('/checklist/:itemId', AuthGuard.authenticate, this.controller.updateChecklistItem);
        this.router.delete('/checklist/:itemId', AuthGuard.authenticate, this.controller.deleteChecklistItem);
        this.router.get('/tasks/:taskId/attachments', AuthGuard.authenticate, this.controller.getAttachments);
        this.router.post('/tasks/:taskId/attachments', AuthGuard.authenticate, this.controller.addAttachment);

        // --- Workspaces (Base) ---
        this.router.post('/', AuthGuard.authenticate, this.controller.createWorkspace);
        this.router.get('/', AuthGuard.authenticate, this.controller.getMyWorkspaces);

        // --- Projects (Dynamic workspaceId parameter /:workspaceId/) ---
        this.router.get('/:workspaceId/projects', AuthGuard.authenticate, this.controller.getProjects);
        this.router.post('/:workspaceId/projects', AuthGuard.authenticate, this.controller.createProject);
        this.router.get('/:workspaceId/members', AuthGuard.authenticate, this.controller.getWorkspaceMembers);
    }

    public getRouter(): Router {
        return this.router;
    }
}
