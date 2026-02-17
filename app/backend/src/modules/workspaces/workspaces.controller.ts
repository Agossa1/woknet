import { Request, Response, NextFunction } from "express";
import { WorkspacesService } from "./workspaces.services";
import Logger from "../../infra/logger/winston";
import { CreateWorkspaceSchema, CreateProjectSchema, CreateTaskSchema, UpdateTaskStatusSchema, UpdateTaskSchema, CreateCommentSchema, IdSchema } from "./workspaces.schema";

const AsyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
}

export class WorkspacesController {
    constructor(
        private readonly service: WorkspacesService,
        private readonly logger: Logger
    ) { }

    // POST /workspaces
    createWorkspace = AsyncHandler(async (req: Request, res: Response) => {
        const validation = CreateWorkspaceSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, errors: validation.error.format() });
        }

        const userId = (req as any).user?.id;
        const dto = { ...validation.data, owner_id: userId };

        this.logger.instance.info(`[WorkspacesController] Creating workspace: ${dto.name}`);
        const workspace = await this.service.createWorkspace(dto);

        return res.status(201).json({
            success: true,
            data: workspace
        });
    })

    // GET /workspaces
    getMyWorkspaces = AsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;

        this.logger.instance.info(`[WorkspacesController] Fetching workspaces for user: ${userId}`);
        const workspaces = await this.service.getMyWorkspaces(userId);

        return res.json({
            success: true,
            data: workspaces
        });
    })

    // POST /workspaces/:workspaceId/projects
    createProject = AsyncHandler(async (req: Request, res: Response) => {
        const validation = CreateProjectSchema.safeParse(req.body);
        if (!validation.success) {
            this.logger.instance.warn(`[WorkspacesController] CreateProject validation failed: ${JSON.stringify(validation.error.format())}`);
            return res.status(400).json({ success: false, errors: validation.error.format() });
        }

        const workspaceId = req.params.workspaceId as string;
        const idValidation = IdSchema.safeParse(workspaceId);
        if (!idValidation.success) {
            return res.status(400).json({ success: false, errors: { workspaceId: "Invalid ID version" } });
        }

        const userId = (req as any).user?.id;
        this.logger.instance.info(`[WorkspacesController] Creating project in workspace: ${workspaceId} for user: ${userId}`);
        const dto = { ...validation.data, workspace_id: workspaceId };
        const project = await this.service.createProject(dto, userId);

        return res.status(201).json({
            success: true,
            data: project
        });
    })

    // GET /workspaces/:workspaceId/projects
    getProjects = AsyncHandler(async (req: Request, res: Response) => {
        const workspaceId = req.params.workspaceId as string;
        const idValidation = IdSchema.safeParse(workspaceId);
        if (!idValidation.success) {
            return res.status(400).json({ success: false, errors: { workspaceId: "Invalid ID version" } });
        }

        const userId = (req as any).user?.id;
        const projects = await this.service.getProjects(workspaceId, userId);

        return res.json({
            success: true,
            data: projects
        });
    })

    getWorkspaceMembers = AsyncHandler(async (req: Request, res: Response) => {
        const workspaceId = req.params.workspaceId as string;
        const idValidation = IdSchema.safeParse(workspaceId);
        if (!idValidation.success) {
            return res.status(400).json({ success: false, errors: { workspaceId: "Invalid ID version" } });
        }

        const userId = (req as any).user?.id;
        const members = await this.service.getWorkspaceMembers(workspaceId, userId);

        return res.json({
            success: true,
            data: members
        });
    })

    // POST /projects/:projectId/tasks
    createTask = AsyncHandler(async (req: Request, res: Response) => {
        const validation = CreateTaskSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, errors: validation.error.format() });
        }

        const projectId = req.params.projectId as string;
        const idValidation = IdSchema.safeParse(projectId);
        if (!idValidation.success) {
            return res.status(400).json({ success: false, errors: { projectId: "Invalid ID version" } });
        }

        const userId = (req as any).user?.id;
        const dto = { ...validation.data, project_id: projectId, creator_id: userId };

        this.logger.instance.info(`[WorkspacesController] Creating task in project: ${projectId}`);
        const task = await this.service.createTask(dto, userId);

        return res.status(201).json({
            success: true,
            data: task
        });
    })

    // GET /projects/:projectId/board
    getProjectBoard = AsyncHandler(async (req: Request, res: Response) => {
        const projectId = req.params.projectId as string;
        const idValidation = IdSchema.safeParse(projectId);
        if (!idValidation.success) {
            return res.status(400).json({ success: false, errors: { projectId: "Invalid ID version" } });
        }

        const userId = (req as any).user?.id;
        const board = await this.service.getProjectBoard(projectId, userId);

        return res.json({
            success: true,
            data: board
        });
    })

    // PATCH /tasks/:taskId/status
    updateTaskStatus = AsyncHandler(async (req: Request, res: Response) => {
        const validation = UpdateTaskStatusSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, errors: validation.error.format() });
        }

        const taskId = req.params.taskId as string;
        const idValidation = IdSchema.safeParse(taskId);
        if (!idValidation.success) {
            return res.status(400).json({ success: false, errors: { taskId: "Invalid ID version" } });
        }

        const userId = (req as any).user?.id;
        const { status_id } = validation.data;

        this.logger.instance.info(`[WorkspacesController] Updating task ${taskId} status to ${status_id}`);
        await this.service.updateTaskStatus(taskId, status_id, userId);

        return res.json({
            success: true,
            message: "Task status updated successfully"
        });
    })

    // GET /tasks/:taskId
    getTaskDetail = AsyncHandler(async (req: Request, res: Response) => {
        const taskId = req.params.taskId as string;
        const idValidation = IdSchema.safeParse(taskId);
        if (!idValidation.success) {
            return res.status(400).json({ success: false, errors: { taskId: "Invalid ID version" } });
        }

        const userId = (req as any).user?.id;
        this.logger.instance.info(`[WorkspacesController] Fetching task detail: ${taskId}`);
        const task = await this.service.getTaskDetail(taskId, userId);

        return res.json({
            success: true,
            data: task
        });
    })

    // PATCH /tasks/:taskId
    updateTask = AsyncHandler(async (req: Request, res: Response) => {
        const validation = UpdateTaskSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, errors: validation.error.format() });
        }

        const taskId = req.params.taskId as string;
        const idValidation = IdSchema.safeParse(taskId);
        if (!idValidation.success) {
            return res.status(400).json({ success: false, errors: { taskId: "Invalid ID version" } });
        }

        const userId = (req as any).user?.id;
        this.logger.instance.info(`[WorkspacesController] Updating task: ${taskId}`);
        const task = await this.service.updateTask(taskId, validation.data, userId);

        return res.json({
            success: true,
            data: task,
            message: "Task updated successfully"
        });
    })

    // --- Comments ---
    // GET /tasks/:taskId/comments
    getComments = AsyncHandler(async (req: Request, res: Response) => {
        const taskId = req.params.taskId as string;
        const idValidation = IdSchema.safeParse(taskId);
        if (!idValidation.success) {
            return res.status(400).json({ success: false, errors: { taskId: "Invalid ID version" } });
        }

        const userId = (req as any).user?.id;
        const comments = await this.service.getComments(taskId, userId);

        return res.json({
            success: true,
            data: comments
        });
    })

    // POST /tasks/:taskId/comments
    addComment = AsyncHandler(async (req: Request, res: Response) => {
        const validation = CreateCommentSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, errors: validation.error.format() });
        }

        const taskId = req.params.taskId as string;
        const idValidation = IdSchema.safeParse(taskId);
        if (!idValidation.success) {
            return res.status(400).json({ success: false, errors: { taskId: "Invalid ID version" } });
        }

        const userId = (req as any).user?.id;
        const comment = await this.service.addComment(taskId, validation.data.content, userId);

        return res.status(201).json({
            success: true,
            data: comment
        });
    })

    // --- Tags ---
    // GET /projects/:projectId/tags
    getProjectTags = AsyncHandler(async (req: Request, res: Response) => {
        const projectId = req.params.projectId as string;
        const userId = (req as any).user?.id;
        const tags = await this.service.getProjectTags(projectId, userId);
        return res.json({ success: true, data: tags });
    })

    // POST /tasks/:taskId/tags/:tagId
    addTagToTask = AsyncHandler(async (req: Request, res: Response) => {
        const taskId = req.params.taskId as string;
        const tagId = req.params.tagId as string;
        const userId = (req as any).user?.id;
        await this.service.addTagToTask(taskId, tagId, userId);
        return res.json({ success: true });
    })

    // DELETE /tasks/:taskId/tags/:tagId
    removeTagFromTask = AsyncHandler(async (req: Request, res: Response) => {
        const taskId = req.params.taskId as string;
        const tagId = req.params.tagId as string;
        const userId = (req as any).user?.id;
        await this.service.removeTagFromTask(taskId, tagId, userId);
        return res.json({ success: true });
    })

    // POST /projects/:projectId/tags
    createTag = AsyncHandler(async (req: Request, res: Response) => {
        const projectId = req.params.projectId as string;
        const { name, color } = req.body;
        const userId = (req as any).user?.id;
        const tag = await this.service.createTag(projectId, name, color, userId);
        return res.status(201).json({ success: true, data: tag });
    })

    // --- Checklists ---
    // GET /tasks/:taskId/checklist
    getChecklist = AsyncHandler(async (req: Request, res: Response) => {
        const taskId = req.params.taskId as string;
        const userId = (req as any).user?.id;
        const checklist = await this.service.getChecklist(taskId, userId);
        return res.json({ success: true, data: checklist });
    })

    // POST /tasks/:taskId/checklist
    addChecklistItem = AsyncHandler(async (req: Request, res: Response) => {
        const taskId = req.params.taskId as string;
        const { title } = req.body;
        const userId = (req as any).user?.id;
        const item = await this.service.addChecklistItem(taskId, title, userId);
        return res.status(201).json({ success: true, data: item });
    })

    // PATCH /checklist/:itemId
    updateChecklistItem = AsyncHandler(async (req: Request, res: Response) => {
        const itemId = req.params.itemId as string;
        const userId = (req as any).user?.id;
        const item = await this.service.updateChecklistItem(itemId, req.body, userId);
        return res.json({ success: true, data: item });
    })

    // DELETE /checklist/:itemId
    deleteChecklistItem = AsyncHandler(async (req: Request, res: Response) => {
        const itemId = req.params.itemId as string;
        const userId = (req as any).user?.id;
        await this.service.deleteChecklistItem(itemId, userId);
        return res.json({ success: true });
    })

    // --- Attachments ---
    // GET /tasks/:taskId/attachments
    getAttachments = AsyncHandler(async (req: Request, res: Response) => {
        const taskId = req.params.taskId as string;
        const userId = (req as any).user?.id;
        const attachments = await this.service.getAttachments(taskId, userId);
        return res.json({ success: true, data: attachments });
    })

    // POST /tasks/:taskId/attachments
    addAttachment = AsyncHandler(async (req: Request, res: Response) => {
        const taskId = req.params.taskId as string;
        const { name, url, type, size } = req.body;
        const userId = (req as any).user?.id;
        const attachment = await this.service.addAttachment(taskId, userId, { name, url, type, size });
        return res.status(201).json({ success: true, data: attachment });
    })

    // --- Categories ---
    // GET /projects/:projectId/categories
    getCategories = AsyncHandler(async (req: Request, res: Response) => {
        const projectId = req.params.projectId as string;
        const userId = (req as any).user?.id;
        const categories = await this.service.getCategories(projectId, userId);
        return res.json({ success: true, data: categories });
    })

    // POST /projects/:projectId/categories
    createCategory = AsyncHandler(async (req: Request, res: Response) => {
        const projectId = req.params.projectId as string;
        const { name, color, description } = req.body;
        const userId = (req as any).user?.id;
        const category = await this.service.createCategory(projectId, userId, { name, color, description });
        return res.status(201).json({ success: true, data: category });
    })
}
