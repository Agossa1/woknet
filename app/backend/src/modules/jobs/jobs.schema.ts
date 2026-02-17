
import { z } from 'zod';

export const WorkTypeEnum = z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship', 'temporary']);
export const JobStatusEnum = z.enum(['draft', 'published', 'closed', 'archived']);

export const CreateJobSchema = z.object({
    title: z.string().min(3, "Le titre doit comporter au moins 3 caractères"),
    company_id: z.string().uuid("L'ID de l'entreprise est invalide"),
    description: z.string().optional(),
    requirements: z.string().optional(),
    location: z.string().optional(),
    work_type: WorkTypeEnum.default('full-time').optional(),
    salary_min: z.number().nonnegative().optional(),
    salary_max: z.number().nonnegative().optional(),
    currency: z.string().length(3).default('EUR').optional(),
    is_remote: z.boolean().default(false).optional(),
    application_url: z.string().url("L'URL de candidature est invalide").optional().or(z.literal('')),
    status: JobStatusEnum.default('draft').optional(),
});

export const UpdateJobSchema = CreateJobSchema.partial().omit({ company_id: true });

export const GenerateDescriptionSchema = z.object({
    job_title: z.string().min(2),
    industry: z.string().optional(), // Sector/Domain
    tone: z.string().optional(),
    keywords: z.array(z.string()).optional()
});
