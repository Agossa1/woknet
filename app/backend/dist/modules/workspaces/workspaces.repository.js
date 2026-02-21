"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacesRepository = void 0;
class WorkspacesRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    // --- Workspaces ---
    async createWorkspace(dto) {
        const sql = `
            INSERT INTO workspaces (name, description, owner_id, is_private)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await this.db.query(sql, [
            dto.name,
            dto.description ?? null,
            dto.owner_id,
            dto.is_private ?? true
        ]);
        const workspace = result[0];
        // Also add owner to members table with 'owner' role
        await this.db.query(`INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3)`, [workspace.id, dto.owner_id, 'owner']);
        return workspace;
    }
    async getWorkspacesByUserId(userId) {
        const sql = `
            SELECT w.* FROM workspaces w
            LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
            WHERE w.owner_id = $1 OR wm.user_id = $1
            ORDER BY w.updated_at DESC
        `;
        return await this.db.query(sql, [userId]);
    }
    async getWorkspaceById(id) {
        const sql = `SELECT * FROM workspaces WHERE id = $1`;
        const result = await this.db.query(sql, [id]);
        return result.length > 0 ? result[0] : null;
    }
    async isUserMemberOfWorkspace(workspaceId, userId) {
        const sql = `
            SELECT 1 FROM workspace_members 
            WHERE workspace_id = $1 AND user_id = $2 
            LIMIT 1
        `;
        const result = await this.db.query(sql, [workspaceId, userId]);
        return result.length > 0;
    }
    async getWorkspaceMembers(workspaceId) {
        const sql = `
            SELECT wm.user_id, wm.role, p.display_name, p.avatar_url, p.username
            FROM workspace_members wm
            JOIN profiles p ON wm.user_id = p.user_id
            WHERE wm.workspace_id = $1
            ORDER BY wm.joined_at ASC
        `;
        return await this.db.query(sql, [workspaceId]);
    }
    async isUserMemberOfProject(projectId, userId) {
        const sql = `
            SELECT 1 FROM wp_projects p
            JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
            WHERE p.id = $1 AND wm.user_id = $2
            LIMIT 1
        `;
        const result = await this.db.query(sql, [projectId, userId]);
        return result.length > 0;
    }
    // --- Projects ---
    async createProject(dto) {
        try {
            const sql = `
                INSERT INTO wp_projects (workspace_id, name, description, key_prefix)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            const result = await this.db.query(sql, [
                dto.workspace_id,
                dto.name,
                dto.description ?? null,
                dto.key_prefix
            ]);
            if (!result || result.length === 0) {
                throw new Error("Failed to insert project: No row returned");
            }
            const project = result[0];
            this.logger.instance.info(`[WorkspacesRepository] Project created: ${project.id}. Initializing statuses...`);
            await this.initializeDefaultStatuses(project.id);
            return project;
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesRepository] Error in createProject: ${error}`);
            throw error;
        }
    }
    async initializeDefaultStatuses(projectId) {
        try {
            const statuses = [
                { label: 'À faire', position: 0, color: '#6B7280' },
                { label: 'En cours', position: 1, color: '#3B82F6' },
                { label: 'Terminé', position: 2, color: '#10B981' }
            ];
            for (const status of statuses) {
                await this.db.query(`INSERT INTO wp_statuses (project_id, label, position, color) VALUES ($1, $2, $3, $4)`, [projectId, status.label, status.position, status.color]);
            }
        }
        catch (error) {
            this.logger.instance.error(`[WorkspacesRepository] Error in initializeDefaultStatuses: ${error}`);
            throw error;
        }
    }
    async getProjectsByWorkspaceId(workspaceId) {
        const sql = `SELECT * FROM wp_projects WHERE workspace_id = $1 ORDER BY created_at DESC`;
        return await this.db.query(sql, [workspaceId]);
    }
    async getProjectById(projectId) {
        const sql = `SELECT * FROM wp_projects WHERE id = $1`;
        const result = await this.db.query(sql, [projectId]);
        return result.length > 0 ? result[0] : null;
    }
    // --- Tasks ---
    async createTask(dto) {
        const sql = `
            INSERT INTO wp_tasks (project_id, status_id, creator_id, assignee_id, title, description, priority)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const result = await this.db.query(sql, [
            dto.project_id,
            dto.status_id,
            dto.creator_id,
            dto.assignee_id ?? null,
            dto.title,
            dto.description ?? null,
            dto.priority ?? 'medium'
        ]);
        return result[0];
    }
    async getTasksByProjectId(projectId) {
        const sql = `
            SELECT t.*, 
                   cat.name as category_name,
                   cat.color as category_color,
                   COALESCE(json_agg(DISTINCT jsonb_build_object('id', tg.id, 'name', tg.name, 'color', tg.color)) FILTER (WHERE tg.id IS NOT NULL), '[]') as tags,
                   (SELECT COUNT(*) FROM wp_task_checklists WHERE task_id = t.id) as checklist_total,
                   (SELECT COUNT(*) FROM wp_task_checklists WHERE task_id = t.id AND is_completed = TRUE) as checklist_completed,
                   (SELECT COUNT(*) FROM wp_task_comments WHERE task_id = t.id) as comment_count
            FROM wp_tasks t
            LEFT JOIN wp_task_tags tt ON t.id = tt.task_id
            LEFT JOIN wp_tags tg ON tt.tag_id = tg.id
            LEFT JOIN wp_task_categories cat ON t.category_id = cat.id
            WHERE t.project_id = $1 
            GROUP BY t.id, cat.name, cat.color
            ORDER BY t.task_number DESC
        `;
        return await this.db.query(sql, [projectId]);
    }
    async getStatusesByProjectId(projectId) {
        const sql = `SELECT * FROM wp_statuses WHERE project_id = $1 ORDER BY position ASC`;
        return await this.db.query(sql, [projectId]);
    }
    async getTaskById(taskId) {
        const sql = `
            SELECT t.*, 
                   cat.name as category_name,
                   cat.color as category_color,
                   COALESCE(json_agg(DISTINCT jsonb_build_object('id', tg.id, 'name', tg.name, 'color', tg.color)) FILTER (WHERE tg.id IS NOT NULL), '[]') as tags,
                   (SELECT COUNT(*) FROM wp_task_checklists WHERE task_id = t.id) as checklist_total,
                   (SELECT COUNT(*) FROM wp_task_checklists WHERE task_id = t.id AND is_completed = TRUE) as checklist_completed,
                   (SELECT COUNT(*) FROM wp_task_comments WHERE task_id = t.id) as comment_count
            FROM wp_tasks t
            LEFT JOIN wp_task_tags tt ON t.id = tt.task_id
            LEFT JOIN wp_tags tg ON tt.tag_id = tg.id
            LEFT JOIN wp_task_categories cat ON t.category_id = cat.id
            WHERE t.id = $1
            GROUP BY t.id, cat.name, cat.color
        `;
        const result = await this.db.query(sql, [taskId]);
        return result.length > 0 ? result[0] : null;
    }
    async updateTask(taskId, dto) {
        const fields = [];
        const values = [];
        let index = 2;
        Object.entries(dto).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = $${index}`);
                values.push(value);
                index++;
            }
        });
        if (fields.length === 0) {
            const task = await this.getTaskById(taskId);
            if (!task)
                throw new Error("Task not found");
            return task;
        }
        const sql = `
            UPDATE wp_tasks 
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1 
            RETURNING *
        `;
        const result = await this.db.query(sql, [taskId, ...values]);
        return result[0];
    }
    async updateTaskStatus(taskId, statusId) {
        const sql = `
            UPDATE wp_tasks 
            SET status_id = $2, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1
        `;
        await this.db.query(sql, [taskId, statusId]);
    }
    async getProjectIdByTaskId(taskId) {
        const sql = `SELECT project_id FROM wp_tasks WHERE id = $1`;
        const result = await this.db.query(sql, [taskId]);
        return result.length > 0 ? result[0].project_id : null;
    }
    // --- Comments ---
    async getCommentsByTaskId(taskId) {
        const sql = `
            SELECT c.*, p.display_name, p.avatar_url
            FROM wp_task_comments c
            JOIN profiles p ON c.user_id = p.user_id
            WHERE c.task_id = $1
            ORDER BY c.created_at ASC
        `;
        return await this.db.query(sql, [taskId]);
    }
    async createComment(dto) {
        const sql = `
            INSERT INTO wp_task_comments (task_id, user_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await this.db.query(sql, [dto.task_id, dto.user_id, dto.content]);
        return await this.getCommentById(result[0].id);
    }
    async getCommentById(id) {
        const sql = `
            SELECT c.*, p.display_name, p.avatar_url
            FROM wp_task_comments c
            JOIN profiles p ON c.user_id = p.user_id
            WHERE c.id = $1
        `;
        const result = await this.db.query(sql, [id]);
        return result[0];
    }
    // --- Tags ---
    async getTagsByProjectId(projectId) {
        const sql = `SELECT * FROM wp_tags WHERE project_id = $1 ORDER BY name ASC`;
        return await this.db.query(sql, [projectId]);
    }
    async getTaskTags(taskId) {
        const sql = `
            SELECT t.* FROM wp_tags t
            JOIN wp_task_tags tt ON t.id = tt.tag_id
            WHERE tt.task_id = $1
        `;
        return await this.db.query(sql, [taskId]);
    }
    async addTagToTask(taskId, tagId) {
        const sql = `INSERT INTO wp_task_tags (task_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`;
        await this.db.query(sql, [taskId, tagId]);
    }
    async removeTagFromTask(taskId, tagId) {
        const sql = `DELETE FROM wp_task_tags WHERE task_id = $1 AND tag_id = $2`;
        await this.db.query(sql, [taskId, tagId]);
    }
    async createTag(projectId, name, color) {
        const sql = `INSERT INTO wp_tags (project_id, name, color) VALUES ($1, $2, $3) RETURNING *`;
        const result = await this.db.query(sql, [projectId, name, color]);
        return result[0];
    }
    // --- Checklists ---
    async getChecklistByTaskId(taskId) {
        const sql = `SELECT * FROM wp_task_checklists WHERE task_id = $1 ORDER BY position ASC, created_at ASC`;
        return await this.db.query(sql, [taskId]);
    }
    async addChecklistItem(taskId, title, position) {
        const sql = `INSERT INTO wp_task_checklists (task_id, title, position) VALUES ($1, $2, $3) RETURNING *`;
        const result = await this.db.query(sql, [taskId, title, position]);
        return result[0];
    }
    async updateChecklistItem(id, dto) {
        const fields = Object.keys(dto).map((key, i) => `${key} = $${i + 2}`).join(', ');
        const values = Object.values(dto);
        const sql = `UPDATE wp_task_checklists SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
        const result = await this.db.query(sql, [id, ...values]);
        return result[0];
    }
    async deleteChecklistItem(id) {
        const sql = `DELETE FROM wp_task_checklists WHERE id = $1`;
        await this.db.query(sql, [id]);
    }
    // --- Attachments ---
    async getAttachmentsByTaskId(taskId) {
        const sql = `SELECT * FROM wp_task_attachments WHERE task_id = $1 ORDER BY created_at DESC`;
        return await this.db.query(sql, [taskId]);
    }
    async addAttachment(dto) {
        const sql = `
            INSERT INTO wp_task_attachments (task_id, user_id, file_name, file_url, file_type, file_size)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const result = await this.db.query(sql, [
            dto.task_id, dto.user_id, dto.file_name, dto.file_url, dto.file_type, dto.file_size
        ]);
        return result[0];
    }
    // --- Categories ---
    async getCategoriesByProjectId(projectId) {
        const sql = `SELECT * FROM wp_task_categories WHERE project_id = $1 ORDER BY name ASC`;
        return await this.db.query(sql, [projectId]);
    }
    async createCategory(projectId, name, color, description) {
        const sql = `INSERT INTO wp_task_categories (project_id, name, color, description) VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await this.db.query(sql, [projectId, name, color, description || null]);
        return result[0];
    }
}
exports.WorkspacesRepository = WorkspacesRepository;
//# sourceMappingURL=workspaces.repository.js.map