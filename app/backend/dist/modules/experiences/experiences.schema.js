"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateExperienceSchema = exports.CreateExperienceSchema = void 0;
const zod_1 = require("zod");
const experiences_types_1 = require("./experiences.types");
exports.CreateExperienceSchema = zod_1.z.object({
    profile_id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1),
    company_name: zod_1.z.string().min(1),
    type_job: zod_1.z.nativeEnum(experiences_types_1.TYPEJOB).optional(),
    type_place: zod_1.z.nativeEnum(experiences_types_1.TYPEPLACE).optional(),
    country: zod_1.z.string().min(1),
    city: zod_1.z.string().min(1),
    start_date: zod_1.z.string().or(zod_1.z.date()),
    end_date: zod_1.z.string().or(zod_1.z.date()).optional().nullable(),
    is_current: zod_1.z.boolean().default(false),
    description: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    salary: zod_1.z.string().optional(),
    currency: zod_1.z.string().optional(),
    stack: zod_1.z.string().optional(),
});
exports.UpdateExperienceSchema = exports.CreateExperienceSchema.partial();
//# sourceMappingURL=experiences.schema.js.map