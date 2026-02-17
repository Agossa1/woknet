export interface Company {
    id: string;
    owner_id: string;
    name: string;
    slug: string;
    is_verified: boolean;
    logo_url?: string | null;
    banner_url?: string | null;
    description?: string | null;
    website_url?: string | null;
    company_size?: string | null;
    company_type?: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateCompanyDTO {
    name: string;
    slug: string;
    logo_url?: string;
    banner_url?: string;
    description?: string;
    website_url?: string;
    company_size?: string;
    company_type?: string;
}

export interface UpdateCompanyDTO {
    name?: string;
    slug?: string;
    logo_url?: string | null;
    banner_url?: string | null;
    description?: string | null;
    website_url?: string | null;
    company_size?: string | null;
    company_type?: string | null;
}

export interface CompaniesState {
    myCompanies: Company[];
    currentCompany: Company | null;
    isLoading: boolean;
    error: string | null;
}
