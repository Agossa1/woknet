"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateDescriptionSchema = exports.UpdateJobSchema = exports.CreateJobSchema = exports.JobStatusEnum = exports.WorkTypeEnum = void 0;
const zod_1 = require("zod");
exports.WorkTypeEnum = zod_1.z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship', 'temporary']);
exports.JobStatusEnum = zod_1.z.enum(['draft', 'published', 'closed', 'archived']);
exports.CreateJobSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Le titre doit comporter au moins 3 caractères"),
    company_id: zod_1.z.string().uuid("L'ID de l'entreprise est invalide"),
    description: zod_1.z.string().optional(),
    requirements: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    work_type: exports.WorkTypeEnum.default('full-time').optional(),
    salary_min: zod_1.z.number().nonnegative().optional(),
    salary_max: zod_1.z.number().nonnegative().optional(),
    currency: zod_1.z.string().length(3).default('EUR').optional(),
    is_remote: zod_1.z.boolean().default(false).optional(),
    application_url: zod_1.z.string().url("L'URL de candidature est invalide").optional().or(zod_1.z.literal('')),
    status: exports.JobStatusEnum.default('draft').optional(),
});
exports.UpdateJobSchema = exports.CreateJobSchema.partial().omit({ company_id: true });
exports.GenerateDescriptionSchema = zod_1.z.object({
    job_title: zod_1.z.string().min(2),
    industry: zod_1.z.string().optional(), // Sector/Domain
    tone: zod_1.z.string().optional(),
    keywords: zod_1.z.array(zod_1.z.string()).optional()
});
//# sourceMappingURL=jobs.schema.js.map