import { Request, Response, NextFunction } from "express";
import { ProfilesServices } from "./profiles.services";
import Logger from "../../infra/logger/winston";
import { UpdateProfilesSchema } from "./profiles.schema";



const AsyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
}

export class ProfilesController {

    constructor(
        private readonly profileService: ProfilesServices,
        private readonly logger: Logger
    ) { }

    // GET /profiles/:userId
    getProfileByUserId = AsyncHandler(async (req: Request, res: Response) => {
        const userId = req.params.userId as string;
        this.logger.instance.info(`[ProfilesController] Fetching profile for User ID: ${userId}`);
        const profile = await this.profileService.getProfileByUserId(userId);
        if (!profile) {
            this.logger.instance.warn(`[ProfilesController] Profile not found for User ID: ${userId}`);
            return res.status(404).json({ success: false, message: "Profile not found" });
        }
        this.logger.instance.info(`[ProfilesController] Profile fetched successfully for User ID: ${userId}`);
        return res.json({
            success: true,
            message: "Profile fetched successfully",
            data: profile
        });
    })

    // PUT /profiles/:userId

    updateProfile = AsyncHandler(async (req: Request, res: Response) => {
        const validatedData = UpdateProfilesSchema.safeParse({ ...req.body, user_id: req.params.userId });
        if (!validatedData.success) {
            this.logger.instance.warn(`[ProfilesController] Validation failed for updating profile: ${JSON.stringify(validatedData.error.issues)}`);
            return res.status(400).json({
                success: false,
                message: "Invalid input",
                errors: validatedData.error.issues
            });
        }

        const updateData = validatedData.data;

        this.logger.instance.info(`[ProfilesController] Updating profile for User ID: ${updateData.user_id} with data: ${JSON.stringify(updateData)}`);

        try {
            const updatedProfile = await this.profileService.updateProfileService(updateData);
            this.logger.instance.info(`[ProfilesController] Profile updated successfully for User ID: ${updateData.user_id}`);
            return res.json({
                success: true,
                message: "Profile updated successfully",
                data: updatedProfile
            });
        } catch (error) {
            this.logger.instance.error(`[ProfilesController] Error updating profile for User ID: ${updateData.user_id}`, error);
            return res.status(500).json({
                success: false,
                message: "Failed to update profile"
            });
        }
    })
}