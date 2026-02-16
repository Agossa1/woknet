import { Request, Response, NextFunction } from "express";
import { ExperiencesServices } from "./experiences.services";
import Logger from "../../infra/logger/winston";
import { CreateExperienceSchema, UpdateExperienceSchema } from "./experiences.schema";

const AsyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
}

export class ExperiencesController {

    constructor(
        private readonly experiencesService: ExperiencesServices,
        private readonly logger: Logger
    ) { }

    // POST /experiences
    createExperience = AsyncHandler(async (req: Request, res: Response) => {
        const validatedData = CreateExperienceSchema.safeParse(req.body);
        if (!validatedData.success) {
            this.logger.instance.warn(`[ExperiencesController] Validation failed for creating experience: ${JSON.stringify(validatedData.error.issues)}`);
            return res.status(400).json({
                success: false,
                message: "Invalid input",
                errors: validatedData.error.issues
            });
        }

        const createdExperience = await this.experiencesService.createExperiencesServices(validatedData.data as any);
        return res.status(201).json({
            success: true,
            message: "Experience created successfully",
            data: createdExperience
        });
    })

    // GET /experiences/:id
    getExperienceById = AsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const experience = await this.experiencesService.getExperiencesById(id);
        return res.json({
            success: true,
            data: experience
        });
    })

    // PUT /experiences/:id
    updateExperience = AsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const validatedData = UpdateExperienceSchema.safeParse(req.body);
        if (!validatedData.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid input",
                errors: validatedData.error.issues
            });
        }

        const updatedExperience = await this.experiencesService.updateExperiencesServices(id, validatedData.data as any);
        return res.json({
            success: true,
            message: "Experience updated successfully",
            data: updatedExperience
        });
    })

    // DELETE /experiences/:id
    deleteExperience = AsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        await this.experiencesService.deleteExperiencesServices(id);
        return res.json({
            success: true,
            message: "Experience deleted successfully"
        });
    })

    // GET /experiences/profile/:profileId
    getExperiencesByProfileId = AsyncHandler(async (req: Request, res: Response) => {
        const profileId = req.params.profileId as string;
        const experiences = await this.experiencesService.getExperiencesByProfileId(profileId);
        return res.json({
            success: true,
            data: experiences
        });
    })
}