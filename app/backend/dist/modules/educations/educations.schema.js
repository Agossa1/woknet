"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEducationSchema = exports.CreateEducationSchema = void 0;
const zod_1 = require("zod");
const educations_types_1 = require("./educations.types");
exports.CreateEducationSchema = zod_1.z.object({
    profile_id: zod_1.z.string().uuid(),
    school_name: zod_1.z.string().min(1),
    degree: zod_1.z.nativeEnum(educations_types_1.DEGREE_LEVEL).optional(),
    field_of_study: zod_1.z.string().min(1),
    start_date: zod_1.z.string().or(zod_1.z.date()),
    end_date: zod_1.z.string().or(zod_1.z.date()).optional().nullable(),
    is_current: zod_1.z.boolean().default(false),
    description: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    stack: zod_1.z.string().optional(),
});
exports.UpdateEducationSchema = exports.CreateEducationSchema.partial();
//# sourceMappingURL=educations.schema.js.map