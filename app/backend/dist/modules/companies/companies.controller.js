"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesController = void 0;
const companies_schema_1 = require("./companies.schema");
const AsyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
class CompaniesController {
    constructor(service, logger) {
        this.service = service;
        this.logger = logger;
        this.createCompany = AsyncHandler(async (req, res) => {
            // Log the incoming body to see what is being sent
            this.logger.instance.info(`[CompaniesController] Payload: ${JSON.stringify(req.body)}`);
            const validation = companies_schema_1.CreateCompanySchema.safeParse(req.body);
            if (!validation.success) {
                this.logger.instance.error(`[CompaniesController] Validation error: ${JSON.stringify(validation.error.format())}`);
                return res.status(400).json({ success: false, errors: validation.error.format() });
            }
            const userId = req.user?.id;
            this.logger.instance.info(`[CompaniesController] Creating company: ${validation.data.name}`);
            const company = await this.service.createCompany(userId, validation.data);
            return res.status(201).json({ success: true, data: company });
        });
        this.getMyCompanies = AsyncHandler(async (req, res) => {
            const userId = req.user?.id;
            const companies = await this.service.getMyCompanies(userId);
            return res.json({ success: true, data: companies });
        });
        this.getCompanyBySlug = AsyncHandler(async (req, res) => {
            const rawSlug = req.params.slug;
            const slug = decodeURIComponent(rawSlug).trim();
            try {
                this.logger.instance.info(`[CompaniesController] getCompanyBySlug: '${rawSlug}' -> '${slug}'`);
                const company = await this.service.getCompanyBySlug(slug);
                return res.json({ success: true, data: company });
            }
            catch (error) {
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
        this.getCompanyById = AsyncHandler(async (req, res) => {
            const id = req.params.id;
            const company = await this.service.getCompanyById(id);
            return res.json({ success: true, data: company });
        });
        this.updateCompany = AsyncHandler(async (req, res) => {
            const validation = companies_schema_1.UpdateCompanySchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ success: false, errors: validation.error.format() });
            }
            const userId = req.user?.id;
            const id = req.params.id;
            const company = await this.service.updateCompany(userId, id, validation.data);
            return res.json({ success: true, data: company });
        });
        this.deleteCompany = AsyncHandler(async (req, res) => {
            const userId = req.user?.id;
            const id = req.params.id;
            await this.service.deleteCompany(userId, id);
            return res.json({ success: true, message: "Entreprise supprimée avec succès." });
        });
    }
}
exports.CompaniesController = CompaniesController;
//# sourceMappingURL=companies.controller.js.map