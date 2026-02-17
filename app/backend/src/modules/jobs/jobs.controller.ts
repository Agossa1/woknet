import { Request, Response, NextFunction } from "express";
import { JobsService } from "./jobs.services";
import Logger from "../../infra/logger/winston";
import { CreateJobSchema, UpdateJobSchema, GenerateDescriptionSchema } from "./jobs.schema";

const AsyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export class JobsController {
    constructor(
        private readonly service: JobsService,
        private readonly logger: Logger
    ) { }

    createJob = AsyncHandler(async (req: Request, res: Response) => {
        this.logger.instance.info(`[JobsController] Creating job: ${JSON.stringify(req.body)}`);

        const validation = CreateJobSchema.safeParse(req.body);
        if (!validation.success) {
            this.logger.instance.error(`[JobsController] Validation error: ${JSON.stringify(validation.error.format())}`);
            return res.status(400).json({ success: false, errors: validation.error.format() });
        }

        const job = await this.service.createJob(validation.data);
        return res.status(201).json({ success: true, data: job });
    });

    getJobById = AsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const job = await this.service.getJobById(id);
        return res.json({ success: true, data: job });
    });

    getJobBySlug = AsyncHandler(async (req: Request, res: Response) => {
        const rawSlug = req.params.slug as string;
        const slug = decodeURIComponent(rawSlug).trim();

        try {
            this.logger.instance.info(`[JobsController] getJobBySlug: '${rawSlug}' -> '${slug}'`);
            const job = await this.service.getJobBySlug(slug);
            return res.json({ success: true, data: job });
        } catch (error: any) {
            this.logger.instance.error(`[JobsController] Error finding job slug '${slug}': ${error}`);
            return res.status(404).json({
                success: false,
                message: error.message || "Offre d'emploi non trouvée",
            });
        }
    });

    getJobsByCompany = AsyncHandler(async (req: Request, res: Response) => {
        const companyId = req.params.companyId as string;
        const jobs = await this.service.getJobsByCompany(companyId);
        return res.json({ success: true, data: jobs });
    });

    getAllJobs = AsyncHandler(async (req: Request, res: Response) => {
        const { status, is_remote } = req.query;
        const filters: any = {};

        if (status) filters.status = status;
        if (is_remote !== undefined) filters.is_remote = is_remote === 'true';

        const jobs = await this.service.getAllJobs(filters);
        return res.json({ success: true, data: jobs });
    });

    updateJob = AsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;

        const validation = UpdateJobSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, errors: validation.error.format() });
        }

        const job = await this.service.updateJob(id, validation.data);
        return res.json({ success: true, data: job });
    });

    deleteJob = AsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        await this.service.deleteJob(id);
        return res.status(204).send();
    });

    generateDescription = AsyncHandler(async (req: Request, res: Response) => {
        this.logger.instance.info(`[JobsController] Generating description: ${JSON.stringify(req.body)}`);

        const validation = GenerateDescriptionSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, errors: validation.error.format() });
        }

        const result = await this.service.generateJobDescription(validation.data);
        return res.json({ success: true, data: result });
    });
}
