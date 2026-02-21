"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLanguageSchema = exports.CreateLanguageSchema = void 0;
const zod_1 = require("zod");
exports.CreateLanguageSchema = zod_1.z.object({
    profile_id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(100),
    proficiency: zod_1.z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'FLUENT', 'NATIVE']).default('INTERMEDIATE'),
});
exports.UpdateLanguageSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    proficiency: zod_1.z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'FLUENT', 'NATIVE']).optional(),
});
//# sourceMappingURL=languages.schema.js.map