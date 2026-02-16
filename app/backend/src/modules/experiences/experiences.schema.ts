import { z } from "zod";
import { TYPEJOB, TYPEPLACE } from "./experiences.types";

export const CreateExperienceSchema = z.object({
    profile_id: z.string().uuid(),
    title: z.string().min(1),
    company_name: z.string().min(1),
    type_job: z.nativeEnum(TYPEJOB).optional(),
    type_place: z.nativeEnum(TYPEPLACE).optional(),
    country: z.string().min(1),
    city: z.string().min(1),
    start_date: z.string().or(z.date()),
    end_date: z.string().or(z.date()).optional().nullable(),
    is_current: z.boolean().default(false),
    description: z.string().optional(),
    location: z.string().optional(),
    salary: z.string().optional(),
    currency: z.string().optional(),
    stack: z.string().optional(),
});

export const UpdateExperienceSchema = CreateExperienceSchema.partial();

export type CreateExperienceDTO = z.infer<typeof CreateExperienceSchema>;
export type UpdateExperienceDTO = z.infer<typeof UpdateExperienceSchema>;