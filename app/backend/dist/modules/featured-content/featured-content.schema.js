"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFeaturedContentSchema = exports.CreateFeaturedContentSchema = void 0;
const zod_1 = require("zod");
exports.CreateFeaturedContentSchema = zod_1.z.object({
    profile_id: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['POST', 'PROJECT', 'EXTERNAL_LINK']),
    target_id: zod_1.z.string().uuid().optional().nullable(),
    title: zod_1.z.string().max(255).optional().nullable(),
    description: zod_1.z.string().optional().nullable(),
    thumbnail_url: zod_1.z.string().optional().nullable(),
    external_url: zod_1.z.string().url().optional().nullable().or(zod_1.z.literal("")),
    order_index: zod_1.z.number().int().optional().default(0),
});
exports.UpdateFeaturedContentSchema = zod_1.z.object({
    title: zod_1.z.string().max(255).optional().nullable(),
    description: zod_1.z.string().optional().nullable(),
    thumbnail_url: zod_1.z.string().optional().nullable(),
    external_url: zod_1.z.string().url().optional().nullable().or(zod_1.z.literal("")),
    order_index: zod_1.z.number().int().optional(),
});
//# sourceMappingURL=featured-content.schema.js.map