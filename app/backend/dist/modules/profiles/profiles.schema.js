"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfilesSchema = void 0;
const zod_1 = require("zod");
exports.UpdateProfilesSchema = zod_1.z.object({
    user_id: zod_1.z.string(),
    username: zod_1.z.string().max(30).optional().nullable().or(zod_1.z.literal("")),
    display_name: zod_1.z.string().max(50).optional().nullable().or(zod_1.z.literal("")),
    avatar_url: zod_1.z.string().optional().nullable().or(zod_1.z.literal("")),
    banner_url: zod_1.z.string().optional().nullable().or(zod_1.z.literal("")),
    website_url: zod_1.z.string().optional().nullable().or(zod_1.z.literal("")),
    social_github: zod_1.z.string().optional().nullable().or(zod_1.z.literal("")),
    social_twitter: zod_1.z.string().optional().nullable().or(zod_1.z.literal("")),
    social_linkedin: zod_1.z.string().optional().nullable().or(zod_1.z.literal("")),
    social_instagram: zod_1.z.string().optional().nullable().or(zod_1.z.literal("")),
    social_facebook: zod_1.z.string().optional().nullable().or(zod_1.z.literal("")),
    social_tiktok: zod_1.z.string().optional().nullable().or(zod_1.z.literal("")),
    social_youtube: zod_1.z.string().optional().nullable().or(zod_1.z.literal("")),
    social_whatsapp: zod_1.z.string().optional().nullable().or(zod_1.z.literal("")),
    social_telegram: zod_1.z.string().optional().nullable().or(zod_1.z.literal("")),
    social_snapchat: zod_1.z.string().optional().nullable().or(zod_1.z.literal("")),
    social_discord: zod_1.z.string().optional().nullable().or(zod_1.z.literal("")),
    social_twitch: zod_1.z.string().optional().nullable().or(zod_1.z.literal("")),
    social_reddit: zod_1.z.string().optional().nullable().or(zod_1.z.literal("")),
    social_other: zod_1.z.string().optional().nullable().or(zod_1.z.literal("")),
    bio: zod_1.z.string().max(500).optional().nullable().or(zod_1.z.literal("")),
    location_coords: zod_1.z.object({
        latitude: zod_1.z.number(),
        longitude: zod_1.z.number(),
    }).optional().nullable(),
    location_name: zod_1.z.string().max(100).optional().nullable().or(zod_1.z.literal("")),
});
//# sourceMappingURL=profiles.schema.js.map