import { z } from "zod";

export const CreateFeaturedContentSchema = z.object({
    profile_id: z.string().uuid(),
    type: z.enum(['POST', 'PROJECT', 'EXTERNAL_LINK']),
    target_id: z.string().uuid().optional().nullable(),
    title: z.string().max(255).optional().nullable(),
    description: z.string().optional().nullable(),
    thumbnail_url: z.string().optional().nullable(),
    external_url: z.string().url().optional().nullable().or(z.literal("")),
    order_index: z.number().int().optional().default(0),
});

export const UpdateFeaturedContentSchema = z.object({
    title: z.string().max(255).optional().nullable(),
    description: z.string().optional().nullable(),
    thumbnail_url: z.string().optional().nullable(),
    external_url: z.string().url().optional().nullable().or(z.literal("")),
    order_index: z.number().int().optional(),
});
