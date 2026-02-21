"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacesRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
class WorkspacesRouter {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // --- Tasks & Board (Literal prefix /projects/) ---
        this.router.post('/projects/:projectId/tasks', auth_middleware_1.AuthGuard.authenticate, this.controller.createTask);
        this.router.get('/projects/:projectId/board', auth_middleware_1.AuthGuard.authenticate, this.controller.getProjectBoard);
        this.router.get('/projects/:projectId/tags', auth_middleware_1.AuthGuard.authenticate, this.controller.getProjectTags);
        this.router.post('/projects/:projectId/tags', auth_middleware_1.AuthGuard.authenticate, this.controller.createTag);
        this.router.get('/projects/:projectId/categories', auth_middleware_1.AuthGuard.authenticate, this.controller.getCategories);
        this.router.post('/projects/:projectId/categories', auth_middleware_1.AuthGuard.authenticate, this.controller.createCategory);
        this.router.get('/tasks/:taskId', auth_middleware_1.AuthGuard.authenticate, this.controller.getTaskDetail);
        this.router.patch('/tasks/:taskId', auth_middleware_1.AuthGuard.authenticate, this.controller.updateTask);
        this.router.patch('/tasks/:taskId/status', auth_middleware_1.AuthGuard.authenticate, this.controller.updateTaskStatus);
        this.router.get('/tasks/:taskId/comments', auth_middleware_1.AuthGuard.authenticate, this.controller.getComments);
        this.router.post('/tasks/:taskId/comments', auth_middleware_1.AuthGuard.authenticate, this.controller.addComment);
        this.router.post('/tasks/:taskId/tags/:tagId', auth_middleware_1.AuthGuard.authenticate, this.controller.addTagToTask);
        this.router.delete('/tasks/:taskId/tags/:tagId', auth_middleware_1.AuthGuard.authenticate, this.controller.removeTagFromTask);
        this.router.get('/tasks/:taskId/checklist', auth_middleware_1.AuthGuard.authenticate, this.controller.getChecklist);
        this.router.post('/tasks/:taskId/checklist', auth_middleware_1.AuthGuard.authenticate, this.controller.addChecklistItem);
        this.router.patch('/checklist/:itemId', auth_middleware_1.AuthGuard.authenticate, this.controller.updateChecklistItem);
        this.router.delete('/checklist/:itemId', auth_middleware_1.AuthGuard.authenticate, this.controller.deleteChecklistItem);
        this.router.get('/tasks/:taskId/attachments', auth_middleware_1.AuthGuard.authenticate, this.controller.getAttachments);
        this.router.post('/tasks/:taskId/attachments', auth_middleware_1.AuthGuard.authenticate, this.controller.addAttachment);
        // --- Workspaces (Base) ---
        this.router.post('/', auth_middleware_1.AuthGuard.authenticate, this.controller.createWorkspace);
        this.router.get('/', auth_middleware_1.AuthGuard.authenticate, this.controller.getMyWorkspaces);
        // --- Projects (Dynamic workspaceId parameter /:workspaceId/) ---
        this.router.get('/:workspaceId/projects', auth_middleware_1.AuthGuard.authenticate, this.controller.getProjects);
        this.router.post('/:workspaceId/projects', auth_middleware_1.AuthGuard.authenticate, this.controller.createProject);
        this.router.get('/:workspaceId/members', auth_middleware_1.AuthGuard.authenticate, this.controller.getWorkspaceMembers);
    }
    getRouter() {
        return this.router;
    }
}
exports.WorkspacesRouter = WorkspacesRouter;
//# sourceMappingURL=workspaces.routes.js.map