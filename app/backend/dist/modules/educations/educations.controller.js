"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EducationsController = void 0;
const educations_schema_1 = require("./educations.schema");
const AsyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
class EducationsController {
    constructor(educationsService, logger) {
        this.educationsService = educationsService;
        this.logger = logger;
        // POST /educations
        this.createEducation = AsyncHandler(async (req, res) => {
            const validatedData = educations_schema_1.CreateEducationSchema.safeParse(req.body);
            if (!validatedData.success) {
                this.logger.instance.warn(`[EducationsController] Validation failed for creating education: ${JSON.stringify(validatedData.error.issues)}`);
                return res.status(400).json({
                    success: false,
                    message: "Invalid input",
                    errors: validatedData.error.issues
                });
            }
            const createdEducation = await this.educationsService.createEducationService(validatedData.data);
            return res.status(201).json({
                success: true,
                message: "Education created successfully",
                data: createdEducation
            });
        });
        // GET /educations/:id
        this.getEducationById = AsyncHandler(async (req, res) => {
            const id = req.params.id;
            const education = await this.educationsService.getEducationById(id);
            return res.json({
                success: true,
                data: education
            });
        });
        // PUT /educations/:id
        this.updateEducation = AsyncHandler(async (req, res) => {
            const id = req.params.id;
            const validatedData = educations_schema_1.UpdateEducationSchema.safeParse(req.body);
            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid input",
                    errors: validatedData.error.issues
                });
            }
            const updatedEducation = await this.educationsService.updateEducationService(id, validatedData.data);
            return res.json({
                success: true,
                message: "Education updated successfully",
                data: updatedEducation
            });
        });
        // DELETE /educations/:id
        this.deleteEducation = AsyncHandler(async (req, res) => {
            const id = req.params.id;
            await this.educationsService.deleteEducationService(id);
            return res.json({
                success: true,
                message: "Education deleted successfully"
            });
        });
        // GET /educations/profile/:profileId
        this.getEducationsByProfileId = AsyncHandler(async (req, res) => {
            const profileId = req.params.profileId;
            const educations = await this.educationsService.getEducationsByProfileId(profileId);
            return res.json({
                success: true,
                data: educations
            });
        });
    }
}
exports.EducationsController = EducationsController;
//# sourceMappingURL=educations.controller.js.map