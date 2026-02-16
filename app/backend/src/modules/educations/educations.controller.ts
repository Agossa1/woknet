import { Request, Response, NextFunction } from "express";
import { EducationsServices } from "./educations.services";
import Logger from "../../infra/logger/winston";
import { CreateEducationSchema, UpdateEducationSchema } from "./educations.schema";

const AsyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
}

export class EducationsController {

    constructor(
        private readonly educationsService: EducationsServices,
        private readonly logger: Logger
    ) { }

    // POST /educations
    createEducation = AsyncHandler(async (req: Request, res: Response) => {
        const validatedData = CreateEducationSchema.safeParse(req.body);
        if (!validatedData.success) {
            this.logger.instance.warn(`[EducationsController] Validation failed for creating education: ${JSON.stringify(validatedData.error.issues)}`);
            return res.status(400).json({
                success: false,
                message: "Invalid input",
                errors: validatedData.error.issues
            });
        }

        const createdEducation = await this.educationsService.createEducationService(validatedData.data as any);
        return res.status(201).json({
            success: true,
            message: "Education created successfully",
            data: createdEducation
        });
    })

    // GET /educations/:id
    getEducationById = AsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const education = await this.educationsService.getEducationById(id);
        return res.json({
            success: true,
            data: education
        });
    })

    // PUT /educations/:id
    updateEducation = AsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const validatedData = UpdateEducationSchema.safeParse(req.body);
        if (!validatedData.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid input",
                errors: validatedData.error.issues
            });
        }

        const updatedEducation = await this.educationsService.updateEducationService(id, validatedData.data as any);
        return res.json({
            success: true,
            message: "Education updated successfully",
            data: updatedEducation
        });
    })

    // DELETE /educations/:id
    deleteEducation = AsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        await this.educationsService.deleteEducationService(id);
        return res.json({
            success: true,
            message: "Education deleted successfully"
        });
    })

    // GET /educations/profile/:profileId
    getEducationsByProfileId = AsyncHandler(async (req: Request, res: Response) => {
        const profileId = req.params.profileId as string;
        const educations = await this.educationsService.getEducationsByProfileId(profileId);
        return res.json({
            success: true,
            data: educations
        });
    })
}
