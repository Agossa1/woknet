"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCertificationSchema = exports.CreateCertificationSchema = void 0;
const zod_1 = require("zod");
exports.CreateCertificationSchema = zod_1.z.object({
    profile_id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(255),
    issuing_organization: zod_1.z.string().min(1).max(255),
    issue_date: zod_1.z.string().optional().nullable(),
    expiration_date: zod_1.z.string().optional().nullable(),
    credential_id: zod_1.z.string().optional().nullable(),
    credential_url: zod_1.z.string().url().optional().nullable().or(zod_1.z.literal("")),
});
exports.UpdateCertificationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    issuing_organization: zod_1.z.string().min(1).max(255).optional(),
    issue_date: zod_1.z.string().optional().nullable(),
    expiration_date: zod_1.z.string().optional().nullable(),
    credential_id: zod_1.z.string().optional().nullable(),
    credential_url: zod_1.z.string().url().optional().nullable().or(zod_1.z.literal("")),
});
//# sourceMappingURL=certifications.schema.js.map