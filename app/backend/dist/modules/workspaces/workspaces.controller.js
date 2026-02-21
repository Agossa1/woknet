"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacesController = void 0;
const workspaces_schema_1 = require("./workspaces.schema");
const AsyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
class WorkspacesController {
    constructor(service, logger) {
        this.service = service;
        this.logger = logger;
        // POST /workspaces
        this.createWorkspace = AsyncHandler(async (req, res) => {
            const validation = workspaces_schema_1.CreateWorkspaceSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ success: false, errors: validation.error.format() });
            }
            const userId = req.user?.id;
            const dto = { ...validation.data, owner_id: userId };
            this.logger.instance.info(`[WorkspacesController] Creating workspace: ${dto.name}`);
            const workspace = await this.service.createWorkspace(dto);
            return res.status(201).json({
                success: true,
                data: workspace
            });
        });
        // GET /workspaces
        this.getMyWorkspaces = AsyncHandler(async (req, res) => {
            const userId = req.user?.id;
            this.logger.instance.info(`[WorkspacesController] Fetching workspaces for user: ${userId}`);
            const workspaces = await this.service.getMyWorkspaces(userId);
            return res.json({
                success: true,
                data: workspaces
            });
        });
        // POST /workspaces/:workspaceId/projects
        this.createProject = AsyncHandler(async (req, res) => {
            const validation = workspaces_schema_1.CreateProjectSchema.safeParse(req.body);
            if (!validation.success) {
                this.logger.instance.warn(`[WorkspacesController] CreateProject validation failed: ${JSON.stringify(validation.error.format())}`);
                return res.status(400).json({ success: false, errors: validation.error.format() });
            }
            const workspaceId = req.params.workspaceId;
            const idValidation = workspaces_schema_1.IdSchema.safeParse(workspaceId);
            if (!idValidation.success) {
                return res.status(400).json({ success: false, errors: { workspaceId: "Invalid ID version" } });
            }
            const userId = req.user?.id;
            this.logger.instance.info(`[WorkspacesController] Creating project in workspace: ${workspaceId} for user: ${userId}`);
            const dto = { ...validation.data, workspace_id: workspaceId };
            const project = await this.service.createProject(dto, userId);
            return res.status(201).json({
                success: true,
                data: project
            });
        });
        // GET /workspaces/:workspaceId/projects
        this.getProjects = AsyncHandler(async (req, res) => {
            const workspaceId = req.params.workspaceId;
            const idValidation = workspaces_schema_1.IdSchema.safeParse(workspaceId);
            if (!idValidation.success) {
                return res.status(400).json({ success: false, errors: { workspaceId: "Invalid ID version" } });
            }
            const userId = req.user?.id;
            const projects = await this.service.getProjects(workspaceId, userId);
            return res.json({
                success: true,
                data: projects
            });
        });
        this.getWorkspaceMembers = AsyncHandler(async (req, res) => {
            const workspaceId = req.params.workspaceId;
            const idValidation = workspaces_schema_1.IdSchema.safeParse(workspaceId);
            if (!idValidation.success) {
                return res.status(400).json({ success: false, errors: { workspaceId: "Invalid ID version" } });
            }
            const userId = req.user?.id;
            const members = await this.service.getWorkspaceMembers(workspaceId, userId);
            return res.json({
                success: true,
                data: members
            });
        });
        // POST /projects/:projectId/tasks
        this.createTask = AsyncHandler(async (req, res) => {
            const validation = workspaces_schema_1.CreateTaskSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ success: false, errors: validation.error.format() });
            }
            const projectId = req.params.projectId;
            const idValidation = workspaces_schema_1.IdSchema.safeParse(projectId);
            if (!idValidation.success) {
                return res.status(400).json({ success: false, errors: { projectId: "Invalid ID version" } });
            }
            const userId = req.user?.id;
            const dto = { ...validation.data, project_id: projectId, creator_id: userId };
            this.logger.instance.info(`[WorkspacesController] Creating task in project: ${projectId}`);
            const task = await this.service.createTask(dto, userId);
            return res.status(201).json({
                success: true,
                data: task
            });
        });
        // GET /projects/:projectId/board
        this.getProjectBoard = AsyncHandler(async (req, res) => {
            const projectId = req.params.projectId;
            const idValidation = workspaces_schema_1.IdSchema.safeParse(projectId);
            if (!idValidation.success) {
                return res.status(400).json({ success: false, errors: { projectId: "Invalid ID version" } });
            }
            const userId = req.user?.id;
            const board = await this.service.getProjectBoard(projectId, userId);
            return res.json({
                success: true,
                data: board
            });
        });
        // PATCH /tasks/:taskId/status
        this.updateTaskStatus = AsyncHandler(async (req, res) => {
            const validation = workspaces_schema_1.UpdateTaskStatusSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ success: false, errors: validation.error.format() });
            }
            const taskId = req.params.taskId;
            const idValidation = workspaces_schema_1.IdSchema.safeParse(taskId);
            if (!idValidation.success) {
                return res.status(400).json({ success: false, errors: { taskId: "Invalid ID version" } });
            }
            const userId = req.user?.id;
            const { status_id } = validation.data;
            this.logger.instance.info(`[WorkspacesController] Updating task ${taskId} status to ${status_id}`);
            await this.service.updateTaskStatus(taskId, status_id, userId);
            return res.json({
                success: true,
                message: "Task status updated successfully"
            });
        });
        // GET /tasks/:taskId
        this.getTaskDetail = AsyncHandler(async (req, res) => {
            const taskId = req.params.taskId;
            const idValidation = workspaces_schema_1.IdSchema.safeParse(taskId);
            if (!idValidation.success) {
                return res.status(400).json({ success: false, errors: { taskId: "Invalid ID version" } });
            }
            const userId = req.user?.id;
            this.logger.instance.info(`[WorkspacesController] Fetching task detail: ${taskId}`);
            const task = await this.service.getTaskDetail(taskId, userId);
            return res.json({
                success: true,
                data: task
            });
        });
        // PATCH /tasks/:taskId
        this.updateTask = AsyncHandler(async (req, res) => {
            const validation = workspaces_schema_1.UpdateTaskSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ success: false, errors: validation.error.format() });
            }
            const taskId = req.params.taskId;
            const idValidation = workspaces_schema_1.IdSchema.safeParse(taskId);
            if (!idValidation.success) {
                return res.status(400).json({ success: false, errors: { taskId: "Invalid ID version" } });
            }
            const userId = req.user?.id;
            this.logger.instance.info(`[WorkspacesController] Updating task: ${taskId}`);
            const task = await this.service.updateTask(taskId, validation.data, userId);
            return res.json({
                success: true,
                data: task,
                message: "Task updated successfully"
            });
        });
        // --- Comments ---
        // GET /tasks/:taskId/comments
        this.getComments = AsyncHandler(async (req, res) => {
            const taskId = req.params.taskId;
            const idValidation = workspaces_schema_1.IdSchema.safeParse(taskId);
            if (!idValidation.success) {
                return res.status(400).json({ success: false, errors: { taskId: "Invalid ID version" } });
            }
            const userId = req.user?.id;
            const comments = await this.service.getComments(taskId, userId);
            return res.json({
                success: true,
                data: comments
            });
        });
        // POST /tasks/:taskId/comments
        this.addComment = AsyncHandler(async (req, res) => {
            const validation = workspaces_schema_1.CreateCommentSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ success: false, errors: validation.error.format() });
            }
            const taskId = req.params.taskId;
            const idValidation = workspaces_schema_1.IdSchema.safeParse(taskId);
            if (!idValidation.success) {
                return res.status(400).json({ success: false, errors: { taskId: "Invalid ID version" } });
            }
            const userId = req.user?.id;
            const comment = await this.service.addComment(taskId, validation.data.content, userId);
            return res.status(201).json({
                success: true,
                data: comment
            });
        });
        // --- Tags ---
        // GET /projects/:projectId/tags
        this.getProjectTags = AsyncHandler(async (req, res) => {
            const projectId = req.params.projectId;
            const userId = req.user?.id;
            const tags = await this.service.getProjectTags(projectId, userId);
            return res.json({ success: true, data: tags });
        });
        // POST /tasks/:taskId/tags/:tagId
        this.addTagToTask = AsyncHandler(async (req, res) => {
            const taskId = req.params.taskId;
            const tagId = req.params.tagId;
            const userId = req.user?.id;
            await this.service.addTagToTask(taskId, tagId, userId);
            return res.json({ success: true });
        });
        // DELETE /tasks/:taskId/tags/:tagId
        this.removeTagFromTask = AsyncHandler(async (req, res) => {
            const taskId = req.params.taskId;
            const tagId = req.params.tagId;
            const userId = req.user?.id;
            await this.service.removeTagFromTask(taskId, tagId, userId);
            return res.json({ success: true });
        });
        // POST /projects/:projectId/tags
        this.createTag = AsyncHandler(async (req, res) => {
            const projectId = req.params.projectId;
            const { name, color } = req.body;
            const userId = req.user?.id;
            const tag = await this.service.createTag(projectId, name, color, userId);
            return res.status(201).json({ success: true, data: tag });
        });
        // --- Checklists ---
        // GET /tasks/:taskId/checklist
        this.getChecklist = AsyncHandler(async (req, res) => {
            const taskId = req.params.taskId;
            const userId = req.user?.id;
            const checklist = await this.service.getChecklist(taskId, userId);
            return res.json({ success: true, data: checklist });
        });
        // POST /tasks/:taskId/checklist
        this.addChecklistItem = AsyncHandler(async (req, res) => {
            const taskId = req.params.taskId;
            const { title } = req.body;
            const userId = req.user?.id;
            const item = await this.service.addChecklistItem(taskId, title, userId);
            return res.status(201).json({ success: true, data: item });
        });
        // PATCH /checklist/:itemId
        this.updateChecklistItem = AsyncHandler(async (req, res) => {
            const itemId = req.params.itemId;
            const userId = req.user?.id;
            const item = await this.service.updateChecklistItem(itemId, req.body, userId);
            return res.json({ success: true, data: item });
        });
        // DELETE /checklist/:itemId
        this.deleteChecklistItem = AsyncHandler(async (req, res) => {
            const itemId = req.params.itemId;
            const userId = req.user?.id;
            await this.service.deleteChecklistItem(itemId, userId);
            return res.json({ success: true });
        });
        // --- Attachments ---
        // GET /tasks/:taskId/attachments
        this.getAttachments = AsyncHandler(async (req, res) => {
            const taskId = req.params.taskId;
            const userId = req.user?.id;
            const attachments = await this.service.getAttachments(taskId, userId);
            return res.json({ success: true, data: attachments });
        });
        // POST /tasks/:taskId/attachments
        this.addAttachment = AsyncHandler(async (req, res) => {
            const taskId = req.params.taskId;
            const { name, url, type, size } = req.body;
            const userId = req.user?.id;
            const attachment = await this.service.addAttachment(taskId, userId, { name, url, type, size });
            return res.status(201).json({ success: true, data: attachment });
        });
        // --- Categories ---
        // GET /projects/:projectId/categories
        this.getCategories = AsyncHandler(async (req, res) => {
            const projectId = req.params.projectId;
            const userId = req.user?.id;
            const categories = await this.service.getCategories(projectId, userId);
            return res.json({ success: true, data: categories });
        });
        // POST /projects/:projectId/categories
        this.createCategory = AsyncHandler(async (req, res) => {
            const projectId = req.params.projectId;
            const { name, color, description } = req.body;
            const userId = req.user?.id;
            const category = await this.service.createCategory(projectId, userId, { name, color, description });
            return res.status(201).json({ success: true, data: category });
        });
    }
}
exports.WorkspacesController = WorkspacesController;
//# sourceMappingURL=workspaces.controller.js.map