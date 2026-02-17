export type JobStatus = 'draft' | 'published' | 'closed' | 'archived';
export type WorkType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' | 'temporary';

export interface Job {
    id: string;
    company_id: string;
    title: string;
    slug: string;
    description: string;
    requirements: string;
    location: string;
    work_type: WorkType;
    salary_min: number;
    salary_max: number;
    currency: string;
    status: JobStatus;
    is_remote: boolean;
    application_url: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CreateJobDTO {
    title: string;
    company_id: string;
    description?: string;
    requirements?: string;
    location?: string;
    work_type?: WorkType;
    salary_min?: number;
    salary_max?: number;
    currency?: string;
    is_remote?: boolean;
    application_url?: string;
    status?: JobStatus;
}

export interface UpdateJobDTO {
    title?: string;
    description?: string;
    requirements?: string;
    location?: string;
    work_type?: WorkType;
    salary_min?: number;
    salary_max?: number;
    currency?: string;
    status?: JobStatus;
    is_remote?: boolean;
    application_url?: string;
}

export interface GenerateDescriptionDTO {
    job_title: string;
    industry?: string;
    tone?: string;
    keywords?: string[];
}

export interface GeneratedJobDescription {
    full_content: string;
    suggested_salary_range?: {
        min: number;
        max: number;
        currency: string;
    };
}
