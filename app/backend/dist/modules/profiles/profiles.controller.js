"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilesController = void 0;
const profiles_schema_1 = require("./profiles.schema");
const AsyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
class ProfilesController {
    constructor(profileService, logger) {
        this.profileService = profileService;
        this.logger = logger;
        // GET /profiles/:userId
        this.getProfileByUserId = AsyncHandler(async (req, res) => {
            const userId = req.params.userId;
            this.logger.instance.info(`[ProfilesController] Fetching profile for User ID: ${userId}`);
            const profile = await this.profileService.getProfileByUserId(userId);
            if (!profile) {
                this.logger.instance.info(`[ProfilesController] Profile not found for User ID: ${userId}`);
                return res.status(404).json({ success: false, message: "Profile not found" });
            }
            this.logger.instance.info(`[ProfilesController] Profile fetched successfully for User ID: ${userId}`);
            return res.json({
                success: true,
                message: "Profile fetched successfully",
                data: profile
            });
        });
        // PUT /profiles/:userId
        this.updateProfile = AsyncHandler(async (req, res) => {
            const validatedData = profiles_schema_1.UpdateProfilesSchema.safeParse({ ...req.body, user_id: req.params.userId });
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
            }
            catch (error) {
                this.logger.instance.error(`[ProfilesController] Error updating profile for User ID: ${updateData.user_id}`, error);
                return res.status(500).json({
                    success: false,
                    message: "Failed to update profile"
                });
            }
        });
        // GET /profiles/search?query=...
        this.searchProfiles = AsyncHandler(async (req, res) => {
            const query = req.query.query;
            const limit = parseInt(req.query.limit) || 10;
            this.logger.instance.info(`[ProfilesController] Searching profiles with query: ${query}`);
            const profiles = await this.profileService.searchProfilesService(query, limit);
            return res.json({
                success: true,
                data: profiles
            });
        });
        // GET /profiles/recommendations
        this.getRecommendedProfiles = AsyncHandler(async (req, res) => {
            const userId = req.user?.id;
            if (!userId)
                return res.status(401).json({ success: false, message: "Unauthorized" });
            this.logger.instance.info(`[ProfilesController] Fetching recommendations for User ID: ${userId}`);
            const profiles = await this.profileService.getRecommendedProfiles(userId);
            return res.json({
                success: true,
                data: profiles // Le champ 'score' sera visible ici
            });
        });
    }
}
exports.ProfilesController = ProfilesController;
//# sourceMappingURL=profiles.controller.js.map