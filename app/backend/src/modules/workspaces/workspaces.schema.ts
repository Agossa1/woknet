import { z } from "zod";

export const CreateWorkspaceSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().max(500).optional().nullable(),
    is_private: z.boolean().optional()
});

export const CreateProjectSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().max(500).optional().nullable(),
    key_prefix: z.string()
        .trim()
        .min(2, "Key prefix must be at least 2 characters")
        .max(10, "Key prefix cannot exceed 10 characters")
        .toUpperCase()
        .regex(/^[A-Z]+$/, "Key prefix must contain uppercase letters (A-Z) only, no spaces or numbers")
});

export const CreateTaskSchema = z.object({
    status_id: z.string().uuid("Invalid status ID"),
    title: z.string().min(1, "Title is required").max(255),
    description: z.string().optional().nullable(),
    priority: z.enum(['low', 'medium', 'high', 'blocker']).optional(),
    assignee_id: z.string().uuid("Invalid assignee ID").optional().nullable(),
    story_points: z.number().int().positive().optional().nullable(),
    due_date: z.string().optional().nullable() // Will be converted to Date
});

export const UpdateTaskStatusSchema = z.object({
    status_id: z.string().uuid("Invalid status ID")
});

export const UpdateTaskSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional().nullable(),
    priority: z.enum(['low', 'medium', 'high', 'blocker']).optional(),
    status_id: z.string().uuid().optional(),
    assignee_id: z.string().uuid().optional().nullable(),
    story_points: z.number().int().min(0).optional().nullable(),
    due_date: z.string().optional().nullable()
});

export const IdSchema = z.string().uuid("Invalid ID format");

export const CreateCommentSchema = z.object({
    content: z.string().min(1, "Content cannot be empty").max(5000)
});
