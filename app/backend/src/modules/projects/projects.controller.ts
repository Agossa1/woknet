import { Request, Response, NextFunction } from 'express';
import { ProjectsService } from './projects.services';
import { CreateProjectSchema, UpdateProjectSchema } from './projects.schema';
import Logger from '../../infra/logger/winston';

const AsyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
}

export class ProjectsController {
    private projectsService: ProjectsService;
    private logger: Logger;

    constructor(projectsService: ProjectsService) {
        this.projectsService = projectsService;
        this.logger = new Logger();
    }

    createProject = AsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const validData = CreateProjectSchema.safeParse(req.body);
        if (!validData.success) {
            return res.status(400).json({ success: false, message: "Données invalides", errors: validData.error.issues });
        }

        const project = await this.projectsService.createProject(userId, validData.data);
        res.status(201).json({ success: true, data: project });
    });

    updateProject = AsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const projectId = req.params.projectId as string;
        const validData = UpdateProjectSchema.safeParse(req.body);
        if (!validData.success) {
            return res.status(400).json({ success: false, message: "Données invalides", errors: validData.error.issues });
        }

        const project = await this.projectsService.updateProject(userId, projectId, validData.data);
        res.status(200).json({ success: true, data: project });
    });

    deleteProject = AsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const projectId = req.params.projectId as string;
        await this.projectsService.deleteProject(userId, projectId);
        res.status(200).json({ success: true, message: "Projet supprimé avec succès" });
    });

    getProjectsByProfile = AsyncHandler(async (req: Request, res: Response) => {
        const profileId = req.params.profileId as string;
        const projects = await this.projectsService.getProjectsByProfile(profileId);
        res.status(200).json({ success: true, data: projects });
    });

    getProjectById = AsyncHandler(async (req: Request, res: Response) => {
        const projectId = req.params.projectId as string;
        const project = await this.projectsService.getProjectById(projectId);
        res.status(200).json({ success: true, data: project });
    });
}
