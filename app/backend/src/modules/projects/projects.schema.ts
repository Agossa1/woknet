import { z } from "zod";
import { ProjectLinkType } from "./projects.types";

export const ProjectsSchema = z.object({
    profile_id: z.string().uuid("L'ID du profil est invalide"),
    category_id: z.string().uuid().optional().nullable(),
    title: z.string().min(3, "Le titre doit comporter au moins 3 caractères"),
    description: z.string().optional(),
    presentation_url: z.string().url("Le lien de présentation doit être une URL valide"),
    link_platform: z.nativeEnum(ProjectLinkType).default(ProjectLinkType.OTHER).optional(),
    repository_url: z.string().url("Le lien du dépôt doit être une URL valide").optional().nullable().or(z.literal('')),
    thumbnail_url: z.string().url("L'URL de la miniature doit être valide").optional().nullable().or(z.literal('')),
    is_ongoing: z.boolean().default(false).optional(),
    start_date: z.string().optional().nullable(),
    completion_date: z.string().optional().nullable(),
});

export const CreateProjectSchema = ProjectsSchema;
export const UpdateProjectSchema = ProjectsSchema.partial().omit({ profile_id: true });
