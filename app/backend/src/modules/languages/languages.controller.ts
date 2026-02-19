import { Request, Response, NextFunction } from "express";
import { LanguagesService } from "./languages.service";
import Logger from "../../infra/logger/winston";
import { CreateLanguageSchema, UpdateLanguageSchema } from "./languages.schema";

const AsyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
}

export class LanguagesController {
    constructor(
        private readonly languagesService: LanguagesService,
        private readonly logger: Logger
    ) { }

    addLanguage = AsyncHandler(async (req: Request, res: Response) => {
        const validatedData = CreateLanguageSchema.safeParse(req.body);
        if (!validatedData.success) {
            this.logger.instance.warn(`[LanguagesController] Validation failed: ${JSON.stringify(validatedData.error.issues)}`);
            return res.status(400).json({
                success: false,
                message: "Invalid input",
                errors: validatedData.error.issues
            });
        }

        const created = await this.languagesService.addLanguage(validatedData.data as any);
        return res.status(201).json({
            success: true,
            data: created
        });
    })

    getLanguages = AsyncHandler(async (req: Request, res: Response) => {
        const profileId = req.params.profileId as string;
        const result = await this.languagesService.getProfileLanguages(profileId);
        return res.json({
            success: true,
            data: result
        });
    })

    updateLanguage = AsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const validatedData = UpdateLanguageSchema.safeParse(req.body);
        if (!validatedData.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid input",
                errors: validatedData.error.issues
            });
        }

        const updated = await this.languagesService.updateLanguage(id, validatedData.data as any);
        return res.json({
            success: true,
            data: updated
        });
    })

    deleteLanguage = AsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        await this.languagesService.removeLanguage(id);
        return res.json({
            success: true,
            message: "Language deleted"
        });
    })
}
