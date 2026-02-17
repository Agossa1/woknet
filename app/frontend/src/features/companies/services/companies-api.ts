import { api } from "../../api/apiClients";
import { Company, CreateCompanyDTO, UpdateCompanyDTO } from "./companies-types";

export interface CompanyResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const companiesApi = {
    getMyCompanies: () =>
        api.get<CompanyResponse<Company[]>>("/companies/me"),

    createCompany: (dto: CreateCompanyDTO) =>
        api.post<CompanyResponse<Company>>("/companies", dto),

    getCompanyBySlug: (slug: string) =>
        api.get<CompanyResponse<Company>>(`/companies/${slug}`),

    updateCompany: (id: string, dto: UpdateCompanyDTO) =>
        api.put<CompanyResponse<Company>>(`/companies/${id}`, dto),

    deleteCompany: (id: string) =>
        api.delete<CompanyResponse<void>>(`/companies/${id}`),
};
