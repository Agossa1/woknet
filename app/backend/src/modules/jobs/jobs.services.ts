import { JobsRepository } from "./jobs.repository";
import { JobsAIService } from "./jobs.ai.service";
import { CreateJobDTO, UpdateJobDTO, Job, GenerateDescriptionDTO } from "./jobs.types";
import { NotFoundException, ForbiddenException } from "../../errors/custom-errors";
import Logger from "../../infra/logger/winston";

export class JobsService {
    constructor(
        private readonly repository: JobsRepository,
        private readonly aiService: JobsAIService,
        private readonly logger: Logger
    ) { }

    async createJob(dto: CreateJobDTO): Promise<Job> {
        try {
            return await this.repository.createJob(dto);
        } catch (error) {
            this.logger.instance.error(`[JobsService] Error creating job: ${error}`);
            throw error;
        }
    }

    async getJobById(id: string): Promise<Job> {
        const job = await this.repository.getJobById(id);
        if (!job) throw new NotFoundException("Offre d'emploi non trouvée.");
        return job;
    }

    async getJobBySlug(slug: string): Promise<Job> {
        const job = await this.repository.getJobBySlug(slug);
        if (!job) throw new NotFoundException("Offre d'emploi non trouvée.");
        return job;
    }

    async getJobsByCompany(companyId: string): Promise<Job[]> {
        return await this.repository.getJobsByCompany(companyId);
    }

    async getAllJobs(filters?: { status?: string; is_remote?: boolean }): Promise<Job[]> {
        return await this.repository.getAllJobs(filters);
    }

    async updateJob(jobId: string, dto: UpdateJobDTO, companyId?: string): Promise<Job> {
        const job = await this.repository.getJobById(jobId);
        if (!job) throw new NotFoundException("Offre d'emploi non trouvée.");

        // Optional: Verify that the user owns the company
        if (companyId && job.company_id !== companyId) {
            throw new ForbiddenException("Vous n'êtes pas autorisé à modifier cette offre.");
        }

        return await this.repository.updateJob(jobId, dto);
    }

    async deleteJob(jobId: string, companyId?: string): Promise<void> {
        const job = await this.repository.getJobById(jobId);
        if (!job) throw new NotFoundException("Offre d'emploi non trouvée.");

        // Optional: Verify that the user owns the company
        if (companyId && job.company_id !== companyId) {
            throw new ForbiddenException("Vous n'êtes pas autorisé à supprimer cette offre.");
        }

        await this.repository.deleteJob(jobId);
    }

    async generateJobDescription(dto: GenerateDescriptionDTO): Promise<{
        description: string;
        requirements: string;
        suggested_salary_range?: { min: number; max: number; currency: string };
    }> {
        return await this.aiService.generateDescription(dto);
    }
}
