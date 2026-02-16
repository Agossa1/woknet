import { z } from "zod";

export const UpdateProfilesSchema = z.object({
    user_id: z.string(),
    username: z.string().max(30).optional().nullable().or(z.literal("")),
    display_name: z.string().max(50).optional().nullable().or(z.literal("")),
    avatar_url: z.string().optional().nullable().or(z.literal("")),
    banner_url: z.string().optional().nullable().or(z.literal("")),
    website_url: z.string().optional().nullable().or(z.literal("")),
    social_github: z.string().optional().nullable().or(z.literal("")),
    social_twitter: z.string().optional().nullable().or(z.literal("")),
    social_linkedin: z.string().optional().nullable().or(z.literal("")),
    social_instagram: z.string().optional().nullable().or(z.literal("")),
    social_facebook: z.string().optional().nullable().or(z.literal("")),
    social_tiktok: z.string().optional().nullable().or(z.literal("")),
    social_youtube: z.string().optional().nullable().or(z.literal("")),
    social_whatsapp: z.string().optional().nullable().or(z.literal("")),
    social_telegram: z.string().optional().nullable().or(z.literal("")),
    social_snapchat: z.string().optional().nullable().or(z.literal("")),
    social_discord: z.string().optional().nullable().or(z.literal("")),
    social_twitch: z.string().optional().nullable().or(z.literal("")),
    social_reddit: z.string().optional().nullable().or(z.literal("")),
    social_other: z.string().optional().nullable().or(z.literal("")),
    bio: z.string().max(500).optional().nullable().or(z.literal("")),
    location_coords: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }).optional().nullable(),
    location_name: z.string().max(100).optional().nullable().or(z.literal("")),
})


export type UpdateProfileDTO = z.infer<typeof UpdateProfilesSchema>;