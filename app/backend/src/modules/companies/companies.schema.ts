import { z } from "zod";

export const CreateCompanySchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    slug: z.string().min(1, "Le slug est requis").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Format de slug invalide"),
    logo_url: z.string().url("URL de logo invalide").optional().or(z.literal("")),
    banner_url: z.string().url("URL de bannière invalide").optional().or(z.literal("")),
    description: z.string().optional(),
    website_url: z.string().url("URL de site web invalide").optional().or(z.literal("")),
    company_size: z.string().optional(),
    company_type: z.string().optional(),
});

export const UpdateCompanySchema = z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    logo_url: z.string().url().nullable().optional().or(z.literal("")),
    banner_url: z.string().url().nullable().optional().or(z.literal("")),
    description: z.string().nullable().optional(),
    website_url: z.string().url().nullable().optional().or(z.literal("")),
    company_size: z.string().nullable().optional(),
    company_type: z.string().nullable().optional(),
});
