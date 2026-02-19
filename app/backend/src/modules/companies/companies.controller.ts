import { Request, Response, NextFunction } from "express";
import { CompaniesService } from "./companies.services";
import Logger from "../../infra/logger/winston";
import { CreateCompanySchema, UpdateCompanySchema } from "./companies.schema";

const AsyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
}

export class CompaniesController {
    constructor(
        private readonly service: CompaniesService,
        private readonly logger: Logger
    ) { }

    createCompany = AsyncHandler(async (req: Request, res: Response) => {
        // Log the incoming body to see what is being sent
        this.logger.instance.info(`[CompaniesController] Payload: ${JSON.stringify(req.body)}`);

        const validation = CreateCompanySchema.safeParse(req.body);
        if (!validation.success) {
            this.logger.instance.error(`[CompaniesController] Validation error: ${JSON.stringify(validation.error.format())}`);
            return res.status(400).json({ success: false, errors: validation.error.format() });
        }

        const userId = (req as any).user?.id;
        this.logger.instance.info(`[CompaniesController] Creating company: ${validation.data.name}`);
        const company = await this.service.createCompany(userId, validation.data);
        return res.status(201).json({ success: true, data: company });
    });

    getMyCompanies = AsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;
        const companies = await this.service.getMyCompanies(userId);
        return res.json({ success: true, data: companies });
    });

    getCompanyBySlug = AsyncHandler(async (req: Request, res: Response) => {
        const rawSlug = req.params.slug as string;
        const slug = decodeURIComponent(rawSlug).trim();

        try {
            this.logger.instance.info(`[CompaniesController] getCompanyBySlug: '${rawSlug}' -> '${slug}'`);
            const company = await this.service.getCompanyBySlug(slug);
            return res.json({ success: true, data: company });
        } catch (error: any) {
            this.logger.instance.error(`[CompaniesController] Error finding company slug '${slug}': ${error}`);
            return res.status(404).json({
                success: false,
                message: error.message || "Entreprise non trouvée",
                debug_info: {
                    received_raw_slug: rawSlug,
                    processed_slug: slug,
                    slug_type: typeof slug,
                    slug_length: slug?.length,
                    error_message: error.message
                }
            });
        }
    });

    getCompanyById = AsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const company = await this.service.getCompanyById(id);
        return res.json({ success: true, data: company });
    });

    updateCompany = AsyncHandler(async (req: Request, res: Response) => {
        const validation = UpdateCompanySchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, errors: validation.error.format() });
        }

        const userId = (req as any).user?.id;
        const id = req.params.id as string;
        const company = await this.service.updateCompany(userId, id, validation.data);
        return res.json({ success: true, data: company });
    });

    deleteCompany = AsyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;
        const id = req.params.id as string;
        await this.service.deleteCompany(userId, id);
        return res.json({ success: true, message: "Entreprise supprimée avec succès." });
    });
}
