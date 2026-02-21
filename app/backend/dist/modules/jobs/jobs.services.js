"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
class JobsService {
    constructor(repository, aiService, logger) {
        this.repository = repository;
        this.aiService = aiService;
        this.logger = logger;
    }
    async createJob(dto) {
        try {
            return await this.repository.createJob(dto);
        }
        catch (error) {
            this.logger.instance.error(`[JobsService] Error creating job: ${error}`);
            throw error;
        }
    }
    async getJobById(id) {
        const job = await this.repository.getJobById(id);
        if (!job)
            throw new custom_errors_1.NotFoundException("Offre d'emploi non trouvée.");
        return job;
    }
    async getJobBySlug(slug) {
        const job = await this.repository.getJobBySlug(slug);
        if (!job)
            throw new custom_errors_1.NotFoundException("Offre d'emploi non trouvée.");
        return job;
    }
    async getJobsByCompany(companyId) {
        return await this.repository.getJobsByCompany(companyId);
    }
    async getAllJobs(filters) {
        return await this.repository.getAllJobs(filters);
    }
    async updateJob(jobId, dto, companyId) {
        const job = await this.repository.getJobById(jobId);
        if (!job)
            throw new custom_errors_1.NotFoundException("Offre d'emploi non trouvée.");
        // Optional: Verify that the user owns the company
        if (companyId && job.company_id !== companyId) {
            throw new custom_errors_1.ForbiddenException("Vous n'êtes pas autorisé à modifier cette offre.");
        }
        return await this.repository.updateJob(jobId, dto);
    }
    async deleteJob(jobId, companyId) {
        const job = await this.repository.getJobById(jobId);
        if (!job)
            throw new custom_errors_1.NotFoundException("Offre d'emploi non trouvée.");
        // Optional: Verify that the user owns the company
        if (companyId && job.company_id !== companyId) {
            throw new custom_errors_1.ForbiddenException("Vous n'êtes pas autorisé à supprimer cette offre.");
        }
        await this.repository.deleteJob(jobId);
    }
    async generateJobDescription(dto) {
        return await this.aiService.generateDescription(dto);
    }
}
exports.JobsService = JobsService;
//# sourceMappingURL=jobs.services.js.map