"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguagesController = void 0;
const languages_schema_1 = require("./languages.schema");
const AsyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
class LanguagesController {
    constructor(languagesService, logger) {
        this.languagesService = languagesService;
        this.logger = logger;
        this.addLanguage = AsyncHandler(async (req, res) => {
            const validatedData = languages_schema_1.CreateLanguageSchema.safeParse(req.body);
            if (!validatedData.success) {
                this.logger.instance.warn(`[LanguagesController] Validation failed: ${JSON.stringify(validatedData.error.issues)}`);
                return res.status(400).json({
                    success: false,
                    message: "Invalid input",
                    errors: validatedData.error.issues
                });
            }
            const created = await this.languagesService.addLanguage(validatedData.data);
            return res.status(201).json({
                success: true,
                data: created
            });
        });
        this.getLanguages = AsyncHandler(async (req, res) => {
            const profileId = req.params.profileId;
            const result = await this.languagesService.getProfileLanguages(profileId);
            return res.json({
                success: true,
                data: result
            });
        });
        this.updateLanguage = AsyncHandler(async (req, res) => {
            const id = req.params.id;
            const validatedData = languages_schema_1.UpdateLanguageSchema.safeParse(req.body);
            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid input",
                    errors: validatedData.error.issues
                });
            }
            const updated = await this.languagesService.updateLanguage(id, validatedData.data);
            return res.json({
                success: true,
                data: updated
            });
        });
        this.deleteLanguage = AsyncHandler(async (req, res) => {
            const id = req.params.id;
            await this.languagesService.removeLanguage(id);
            return res.json({
                success: true,
                message: "Language deleted"
            });
        });
    }
}
exports.LanguagesController = LanguagesController;
//# sourceMappingURL=languages.controller.js.map