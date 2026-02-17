import { CompaniesRepository } from "./companies.repository";
import { CreateCompanyDTO, UpdateCompanyDTO, Company } from "./companies.types";
import { ForbiddenException, NotFoundException, ConflictException } from "../../errors/custom-errors";
import Logger from "../../infra/logger/winston";

export class CompaniesService {
    constructor(
        private readonly repository: CompaniesRepository,
        private readonly logger: Logger
    ) { }

    async createCompany(userId: string, dto: CreateCompanyDTO): Promise<Company> {
        try {
            // Check if slug is unique
            const existing = await this.repository.getCompanyBySlug(dto.slug);
            if (existing) {
                throw new ConflictException("Une entreprise avec ce slug existe déjà.");
            }

            return await this.repository.createCompany(userId, dto);
        } catch (error) {
            this.logger.instance.error(`[CompaniesService] Error creating company: ${error}`);
            throw error;
        }
    }

    async getMyCompanies(userId: string): Promise<Company[]> {
        return await this.repository.getCompanies(userId);
    }

    async getCompanyBySlug(slug: string): Promise<Company> {
        const company = await this.repository.getCompanyBySlug(slug);
        if (!company) throw new NotFoundException("Entreprise non trouvée.");
        return company;
    }

    async updateCompany(userId: string, companyId: string, dto: UpdateCompanyDTO): Promise<Company> {
        const company = await this.repository.getCompanyById(companyId);
        if (!company) throw new NotFoundException("Entreprise non trouvée.");

        if (company.owner_id !== userId) {
            throw new ForbiddenException("Vous n'êtes pas le propriétaire de cette entreprise.");
        }

        if (dto.slug) {
            const existing = await this.repository.getCompanyBySlug(dto.slug);
            if (existing && existing.id !== companyId) {
                throw new ConflictException("Ce slug est déjà utilisé.");
            }
        }

        return await this.repository.updateCompany(companyId, dto);
    }

    async deleteCompany(userId: string, companyId: string): Promise<void> {
        const company = await this.repository.getCompanyById(companyId);
        if (!company) throw new NotFoundException("Entreprise non trouvée.");

        if (company.owner_id !== userId) {
            throw new ForbiddenException("Vous n'êtes pas le propriétaire de cette entreprise.");
        }

        await this.repository.deleteCompany(companyId);
    }
}
