import { z } from "zod";
import { DEGREE_LEVEL } from "./educations.types";

export const CreateEducationSchema = z.object({
    profile_id: z.string().uuid(),
    school_name: z.string().min(1),
    degree: z.nativeEnum(DEGREE_LEVEL).optional(),
    field_of_study: z.string().min(1),
    start_date: z.string().or(z.date()),
    end_date: z.string().or(z.date()).optional().nullable(),
    is_current: z.boolean().default(false),
    description: z.string().optional(),
    location: z.string().optional(),
    stack: z.string().optional(),
});

export const UpdateEducationSchema = CreateEducationSchema.partial();

export type CreateEducationDTO = z.infer<typeof CreateEducationSchema>;
export type UpdateEducationDTO = z.infer<typeof UpdateEducationSchema>;
