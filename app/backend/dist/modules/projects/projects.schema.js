"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProjectSchema = exports.CreateProjectSchema = exports.ProjectsSchema = void 0;
const zod_1 = require("zod");
const projects_types_1 = require("./projects.types");
exports.ProjectsSchema = zod_1.z.object({
    profile_id: zod_1.z.string().uuid("L'ID du profil est invalide"),
    category_id: zod_1.z.string().uuid().optional().nullable(),
    title: zod_1.z.string().min(3, "Le titre doit comporter au moins 3 caractères"),
    description: zod_1.z.string().optional(),
    presentation_url: zod_1.z.string().url("Le lien de présentation doit être une URL valide"),
    link_platform: zod_1.z.nativeEnum(projects_types_1.ProjectLinkType).default(projects_types_1.ProjectLinkType.OTHER).optional(),
    repository_url: zod_1.z.string().url("Le lien du dépôt doit être une URL valide").optional().nullable().or(zod_1.z.literal('')),
    thumbnail_url: zod_1.z.string().url("L'URL de la miniature doit être valide").optional().nullable().or(zod_1.z.literal('')),
    is_ongoing: zod_1.z.boolean().default(false).optional(),
    start_date: zod_1.z.string().optional().nullable(),
    completion_date: zod_1.z.string().optional().nullable(),
});
exports.CreateProjectSchema = exports.ProjectsSchema;
exports.UpdateProjectSchema = exports.ProjectsSchema.partial().omit({ profile_id: true });
//# sourceMappingURL=projects.schema.js.map