"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperiencesController = void 0;
const experiences_schema_1 = require("./experiences.schema");
const AsyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
class ExperiencesController {
    constructor(experiencesService, logger) {
        this.experiencesService = experiencesService;
        this.logger = logger;
        // POST /experiences
        this.createExperience = AsyncHandler(async (req, res) => {
            const validatedData = experiences_schema_1.CreateExperienceSchema.safeParse(req.body);
            if (!validatedData.success) {
                this.logger.instance.warn(`[ExperiencesController] Validation failed for creating experience: ${JSON.stringify(validatedData.error.issues)}`);
                return res.status(400).json({
                    success: false,
                    message: "Invalid input",
                    errors: validatedData.error.issues
                });
            }
            const createdExperience = await this.experiencesService.createExperiencesServices(validatedData.data);
            return res.status(201).json({
                success: true,
                message: "Experience created successfully",
                data: createdExperience
            });
        });
        // GET /experiences/:id
        this.getExperienceById = AsyncHandler(async (req, res) => {
            const id = req.params.id;
            const experience = await this.experiencesService.getExperiencesById(id);
            return res.json({
                success: true,
                data: experience
            });
        });
        // PUT /experiences/:id
        this.updateExperience = AsyncHandler(async (req, res) => {
            const id = req.params.id;
            const validatedData = experiences_schema_1.UpdateExperienceSchema.safeParse(req.body);
            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid input",
                    errors: validatedData.error.issues
                });
            }
            const updatedExperience = await this.experiencesService.updateExperiencesServices(id, validatedData.data);
            return res.json({
                success: true,
                message: "Experience updated successfully",
                data: updatedExperience
            });
        });
        // DELETE /experiences/:id
        this.deleteExperience = AsyncHandler(async (req, res) => {
            const id = req.params.id;
            await this.experiencesService.deleteExperiencesServices(id);
            return res.json({
                success: true,
                message: "Experience deleted successfully"
            });
        });
        // GET /experiences/profile/:profileId
        this.getExperiencesByProfileId = AsyncHandler(async (req, res) => {
            const profileId = req.params.profileId;
            const experiences = await this.experiencesService.getExperiencesByProfileId(profileId);
            return res.json({
                success: true,
                data: experiences
            });
        });
    }
}
exports.ExperiencesController = ExperiencesController;
//# sourceMappingURL=experiences.controller.js.map