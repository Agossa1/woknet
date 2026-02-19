export interface CertificationDTO {
    id: string;
    profile_id: string;
    name: string;
    issuing_organization: string;
    issue_date: string | null;
    expiration_date: string | null;
    credential_id: string | null;
    credential_url: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface CreateCertificationDTO {
    profile_id: string;
    name: string;
    issuing_organization: string;
    issue_date?: string;
    expiration_date?: string;
    credential_id?: string;
    credential_url?: string;
}

export interface UpdateCertificationDTO {
    name?: string;
    issuing_organization?: string;
    issue_date?: string;
    expiration_date?: string;
    credential_id?: string;
    credential_url?: string;
}

export interface IDatabase {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
}
