import { z } from "zod";

export const CreateLanguageSchema = z.object({
    profile_id: z.string().uuid(),
    name: z.string().min(1).max(100),
    proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'FLUENT', 'NATIVE']).default('INTERMEDIATE'),
});

export const UpdateLanguageSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'FLUENT', 'NATIVE']).optional(),
});

export type CreateLanguageInput = z.infer<typeof CreateLanguageSchema>;
export type UpdateLanguageInput = z.infer<typeof UpdateLanguageSchema>;
