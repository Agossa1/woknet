export interface Workspace {
    id: string;
    name: string;
    description?: string | null;
    owner_id: string;
    is_private: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface WorkspaceMember {
    workspace_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joined_at: Date;
}

export interface WPProject {
    id: string;
    workspace_id: string;
    name: string;
    description?: string | null;
    key_prefix: string;
    created_at: Date;
    updated_at: Date;
}

export interface WPStatus {
    id: string;
    project_id: string;
    label: string;
    position: number;
    color: string;
    created_at: Date;
}

export interface WPTask {
    id: string;
    project_id: string;
    sprint_id?: string;
    status_id: string;
    category_id?: string;
    creator_id: string;
    assignee_id?: string;
    task_number: number;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'blocker';
    story_points?: number;
    time_estimate?: number;
    time_spent: number;
    due_date?: Date;
    completed_at?: Date;
    created_at: Date;
    updated_at: Date;
    tags?: Array<{ id: string, name: string, color: string }>;
    category_name?: string;
    category_color?: string;
    checklist_total?: number;
    checklist_completed?: number;
    comment_count?: number;
}

export interface CreateWorkspaceDTO {
    name: string;
    description?: string | null;
    owner_id: string;
    is_private?: boolean;
}

export interface CreateProjectDTO {
    workspace_id: string;
    name: string;
    description?: string | null;
    key_prefix: string;
}

export interface CreateTaskDTO {
    project_id: string;
    status_id: string;
    creator_id: string;
    title: string;
    description?: string | null;
    priority?: 'low' | 'medium' | 'high' | 'blocker';
    assignee_id?: string | null;
    due_date?: string | null;
}

export interface UpdateTaskStatusDTO {
    status_id: string;
}

export interface UpdateTaskDTO {
    title?: string;
    description?: string | null;
    priority?: 'low' | 'medium' | 'high' | 'blocker';
    status_id?: string;
    assignee_id?: string | null;
    story_points?: number | null;
    due_date?: string | null;
    time_estimate?: number | null;
    time_spent?: number | null;
    category_id?: string | null;
}

export interface WPTaskCategory {
    id: string;
    project_id: string;
    name: string;
    description?: string | null;
    color: string;
    created_at: Date;
}
export interface WPComment {
    id: string;
    task_id: string;
    user_id: string;
    content: string;
    created_at: Date;
    updated_at: Date;
    display_name?: string;
    avatar_url?: string;
}

export interface WPTag {
    id: string;
    project_id: string;
    name: string;
    color: string;
    created_at: Date;
}

export interface WPChecklistItem {
    id: string;
    task_id: string;
    title: string;
    is_completed: boolean;
    position: number;
    created_at: Date;
    updated_at: Date;
}

export interface WPAttachment {
    id: string;
    task_id: string;
    user_id: string;
    file_name: string;
    file_url: string;
    file_type?: string;
    file_size?: number;
    created_at: Date;
}

export interface CreateCommentDTO {
    task_id: string;
    user_id: string;
    content: string;
}
