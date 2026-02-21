"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCompanySchema = exports.CreateCompanySchema = void 0;
const zod_1 = require("zod");
exports.CreateCompanySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Le nom est requis"),
    slug: zod_1.z.string().min(1, "Le slug est requis").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Format de slug invalide"),
    logo_url: zod_1.z.string().url("URL de logo invalide").optional().or(zod_1.z.literal("")),
    banner_url: zod_1.z.string().url("URL de bannière invalide").optional().or(zod_1.z.literal("")),
    description: zod_1.z.string().optional(),
    website_url: zod_1.z.string().url("URL de site web invalide").optional().or(zod_1.z.literal("")),
    company_size: zod_1.z.string().optional(),
    company_type: zod_1.z.string().optional(),
});
exports.UpdateCompanySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    slug: zod_1.z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    logo_url: zod_1.z.string().url().nullable().optional().or(zod_1.z.literal("")),
    banner_url: zod_1.z.string().url().nullable().optional().or(zod_1.z.literal("")),
    description: zod_1.z.string().nullable().optional(),
    website_url: zod_1.z.string().url().nullable().optional().or(zod_1.z.literal("")),
    company_size: zod_1.z.string().nullable().optional(),
    company_type: zod_1.z.string().nullable().optional(),
});
//# sourceMappingURL=companies.schema.js.map