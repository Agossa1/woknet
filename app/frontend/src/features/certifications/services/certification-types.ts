export interface Certification {
    id: string;
    profile_id: string;
    name: string;
    issuing_organization: string;
    issue_date: string | null;
    expiration_date: string | null;
    credential_id: string | null;
    credential_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateCertificationDTO {
    profile_id: string;
    name: string;
    issuing_organization: string;
    issue_date?: string | null;
    expiration_date?: string | null;
    credential_id?: string | null;
    credential_url?: string | null;
}

export interface UpdateCertificationDTO {
    name?: string;
    issuing_organization?: string;
    issue_date?: string | null;
    expiration_date?: string | null;
    credential_id?: string | null;
    credential_url?: string | null;
}
