
import { z } from 'zod';
import { CreateJobSchema, UpdateJobSchema, GenerateDescriptionSchema } from './jobs.schema';

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
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export type CreateJobDTO = z.infer<typeof CreateJobSchema>;
export type UpdateJobDTO = z.infer<typeof UpdateJobSchema>;
export type GenerateDescriptionDTO = z.infer<typeof GenerateDescriptionSchema>;

export interface GeneratedJobDescription {
    full_content: string;
    suggested_salary_range?: { min: number; max: number; currency: string };
}
