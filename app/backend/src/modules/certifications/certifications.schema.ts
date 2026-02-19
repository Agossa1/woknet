import { z } from "zod";

export const CreateCertificationSchema = z.object({
    profile_id: z.string().uuid(),
    name: z.string().min(1).max(255),
    issuing_organization: z.string().min(1).max(255),
    issue_date: z.string().optional().nullable(),
    expiration_date: z.string().optional().nullable(),
    credential_id: z.string().optional().nullable(),
    credential_url: z.string().url().optional().nullable().or(z.literal("")),
});

export const UpdateCertificationSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    issuing_organization: z.string().min(1).max(255).optional(),
    issue_date: z.string().optional().nullable(),
    expiration_date: z.string().optional().nullable(),
    credential_id: z.string().optional().nullable(),
    credential_url: z.string().url().optional().nullable().or(z.literal("")),
});
