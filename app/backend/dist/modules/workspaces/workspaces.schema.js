"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCommentSchema = exports.IdSchema = exports.UpdateTaskSchema = exports.UpdateTaskStatusSchema = exports.CreateTaskSchema = exports.CreateProjectSchema = exports.CreateWorkspaceSchema = void 0;
const zod_1 = require("zod");
exports.CreateWorkspaceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").max(100),
    description: zod_1.z.string().max(500).optional().nullable(),
    is_private: zod_1.z.boolean().optional()
});
exports.CreateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").max(100),
    description: zod_1.z.string().max(500).optional().nullable(),
    key_prefix: zod_1.z.string()
        .trim()
        .min(2, "Key prefix must be at least 2 characters")
        .max(10, "Key prefix cannot exceed 10 characters")
        .toUpperCase()
        .regex(/^[A-Z]+$/, "Key prefix must contain uppercase letters (A-Z) only, no spaces or numbers")
});
exports.CreateTaskSchema = zod_1.z.object({
    status_id: zod_1.z.string().uuid("Invalid status ID"),
    title: zod_1.z.string().min(1, "Title is required").max(255),
    description: zod_1.z.string().optional().nullable(),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'blocker']).optional(),
    assignee_id: zod_1.z.string().uuid("Invalid assignee ID").optional().nullable(),
    story_points: zod_1.z.number().int().positive().optional().nullable(),
    due_date: zod_1.z.string().optional().nullable() // Will be converted to Date
});
exports.UpdateTaskStatusSchema = zod_1.z.object({
    status_id: zod_1.z.string().uuid("Invalid status ID")
});
exports.UpdateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(255).optional(),
    description: zod_1.z.string().max(2000).optional().nullable(),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'blocker']).optional(),
    status_id: zod_1.z.string().uuid().optional(),
    assignee_id: zod_1.z.string().uuid().optional().nullable(),
    story_points: zod_1.z.number().int().min(0).optional().nullable(),
    due_date: zod_1.z.string().optional().nullable()
});
exports.IdSchema = zod_1.z.string().uuid("Invalid ID format");
exports.CreateCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, "Content cannot be empty").max(5000)
});
//# sourceMappingURL=workspaces.schema.js.map