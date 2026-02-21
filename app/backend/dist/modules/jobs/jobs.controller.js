"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsController = void 0;
const jobs_schema_1 = require("./jobs.schema");
const AsyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
class JobsController {
    constructor(service, logger) {
        this.service = service;
        this.logger = logger;
        this.createJob = AsyncHandler(async (req, res) => {
            this.logger.instance.info(`[JobsController] Creating job: ${JSON.stringify(req.body)}`);
            const validation = jobs_schema_1.CreateJobSchema.safeParse(req.body);
            if (!validation.success) {
                this.logger.instance.error(`[JobsController] Validation error: ${JSON.stringify(validation.error.format())}`);
                return res.status(400).json({ success: false, errors: validation.error.format() });
            }
            const job = await this.service.createJob(validation.data);
            return res.status(201).json({ success: true, data: job });
        });
        this.getJobById = AsyncHandler(async (req, res) => {
            const id = req.params.id;
            const job = await this.service.getJobById(id);
            return res.json({ success: true, data: job });
        });
        this.getJobBySlug = AsyncHandler(async (req, res) => {
            const rawSlug = req.params.slug;
            const slug = decodeURIComponent(rawSlug).trim();
            try {
                this.logger.instance.info(`[JobsController] getJobBySlug: '${rawSlug}' -> '${slug}'`);
                const job = await this.service.getJobBySlug(slug);
                return res.json({ success: true, data: job });
            }
            catch (error) {
                this.logger.instance.error(`[JobsController] Error finding job slug '${slug}': ${error}`);
                return res.status(404).json({
                    success: false,
                    message: error.message || "Offre d'emploi non trouvée",
                });
            }
        });
        this.getJobsByCompany = AsyncHandler(async (req, res) => {
            const companyId = req.params.companyId;
            const jobs = await this.service.getJobsByCompany(companyId);
            return res.json({ success: true, data: jobs });
        });
        this.getAllJobs = AsyncHandler(async (req, res) => {
            const { status, is_remote } = req.query;
            const filters = {};
            if (status)
                filters.status = status;
            if (is_remote !== undefined)
                filters.is_remote = is_remote === 'true';
            const jobs = await this.service.getAllJobs(filters);
            return res.json({ success: true, data: jobs });
        });
        this.updateJob = AsyncHandler(async (req, res) => {
            const id = req.params.id;
            const validation = jobs_schema_1.UpdateJobSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ success: false, errors: validation.error.format() });
            }
            const job = await this.service.updateJob(id, validation.data);
            return res.json({ success: true, data: job });
        });
        this.deleteJob = AsyncHandler(async (req, res) => {
            const id = req.params.id;
            await this.service.deleteJob(id);
            return res.status(204).send();
        });
        this.generateDescription = AsyncHandler(async (req, res) => {
            this.logger.instance.info(`[JobsController] Generating description: ${JSON.stringify(req.body)}`);
            const validation = jobs_schema_1.GenerateDescriptionSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ success: false, errors: validation.error.format() });
            }
            const result = await this.service.generateJobDescription(validation.data);
            return res.json({ success: true, data: result });
        });
    }
}
exports.JobsController = JobsController;
//# sourceMappingURL=jobs.controller.js.map