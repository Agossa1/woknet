"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesService = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
class CompaniesService {
    constructor(repository, logger) {
        this.repository = repository;
        this.logger = logger;
    }
    async createCompany(userId, dto) {
        try {
            // Check if slug is unique
            const existing = await this.repository.getCompanyBySlug(dto.slug);
            if (existing) {
                throw new custom_errors_1.ConflictException("Une entreprise avec ce slug existe déjà.");
            }
            return await this.repository.createCompany(userId, dto);
        }
        catch (error) {
            this.logger.instance.error(`[CompaniesService] Error creating company: ${error}`);
            throw error;
        }
    }
    async getMyCompanies(userId) {
        return await this.repository.getCompanies(userId);
    }
    async getCompanyBySlug(slug) {
        const company = await this.repository.getCompanyBySlug(slug);
        if (!company)
            throw new custom_errors_1.NotFoundException("Entreprise non trouvée.");
        return company;
    }
    async getCompanyById(id) {
        const company = await this.repository.getCompanyById(id);
        if (!company)
            throw new custom_errors_1.NotFoundException("Entreprise non trouvée.");
        return company;
    }
    async updateCompany(userId, companyId, dto) {
        const company = await this.repository.getCompanyById(companyId);
        if (!company)
            throw new custom_errors_1.NotFoundException("Entreprise non trouvée.");
        if (company.owner_id !== userId) {
            throw new custom_errors_1.ForbiddenException("Vous n'êtes pas le propriétaire de cette entreprise.");
        }
        if (dto.slug) {
            const existing = await this.repository.getCompanyBySlug(dto.slug);
            if (existing && existing.id !== companyId) {
                throw new custom_errors_1.ConflictException("Ce slug est déjà utilisé.");
            }
        }
        return await this.repository.updateCompany(companyId, dto);
    }
    async deleteCompany(userId, companyId) {
        const company = await this.repository.getCompanyById(companyId);
        if (!company)
            throw new custom_errors_1.NotFoundException("Entreprise non trouvée.");
        if (company.owner_id !== userId) {
            throw new custom_errors_1.ForbiddenException("Vous n'êtes pas le propriétaire de cette entreprise.");
        }
        await this.repository.deleteCompany(companyId);
    }
}
exports.CompaniesService = CompaniesService;
//# sourceMappingURL=companies.services.js.map