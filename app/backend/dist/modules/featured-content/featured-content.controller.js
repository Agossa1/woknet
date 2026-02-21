"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturedContentController = void 0;
const featured_content_schema_1 = require("./featured-content.schema");
const AsyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
class FeaturedContentController {
    constructor(service, logger) {
        this.service = service;
        this.logger = logger;
        this.add = AsyncHandler(async (req, res) => {
            const validatedData = featured_content_schema_1.CreateFeaturedContentSchema.safeParse(req.body);
            if (!validatedData.success) {
                return res.status(400).json({ success: false, errors: validatedData.error.issues });
            }
            const created = await this.service.add(validatedData.data);
            return res.status(201).json({ success: true, data: created });
        });
        this.list = AsyncHandler(async (req, res) => {
            const profileId = req.params.profileId;
            const result = await this.service.getByProfile(profileId);
            return res.json({ success: true, data: result });
        });
        this.update = AsyncHandler(async (req, res) => {
            const id = req.params.id;
            const validatedData = featured_content_schema_1.UpdateFeaturedContentSchema.safeParse(req.body);
            if (!validatedData.success) {
                return res.status(400).json({ success: false, errors: validatedData.error.issues });
            }
            const updated = await this.service.update(id, validatedData.data);
            return res.json({ success: true, data: updated });
        });
        this.delete = AsyncHandler(async (req, res) => {
            const id = req.params.id;
            await this.service.remove(id);
            return res.json({ success: true, message: "Featured content deleted" });
        });
    }
}
exports.FeaturedContentController = FeaturedContentController;
//# sourceMappingURL=featured-content.controller.js.map