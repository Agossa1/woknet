export interface Workspace {
    id: string;
    name: string;
    description?: string | null;
    owner_id: string;
    is_private: boolean;
    created_at: string;
    updated_at: string;
}

export interface WorkspaceMember {
    workspace_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joined_at: string;
}

export interface WPProject {
    id: string;
    workspace_id: string;
    name: string;
    description?: string | null;
    key_prefix: string;
    created_at: string;
    updated_at: string;
}

export interface WPStatus {
    id: string;
    project_id: string;
    label: string;
    position: number;
    color: string;
    created_at: string;
}

export interface WPTask {
    id: string;
    project_id: string;
    sprint_id?: string | null;
    status_id: string;
    category_id?: string | null;
    creator_id: string;
    assignee_id?: string | null;
    task_number: number;
    title: string;
    description?: string | null;
    priority: 'low' | 'medium' | 'high' | 'blocker';
    story_points?: number | null;
    time_estimate?: number | null;
    time_spent: number;
    due_date?: string | null;
    completed_at?: string;
    created_at: string;
    updated_at: string;
    tags?: Array<{ id: string, name: string, color: string }>;
    category_name?: string | null;
    category_color?: string | null;
    checklist_total?: number;
    checklist_completed?: number;
    comment_count?: number;
}

export interface CreateWorkspaceDTO {
    name: string;
    description?: string | null;
    is_private?: boolean;
}

export interface CreateProjectDTO {
    name: string;
    description?: string | null;
    key_prefix: string;
}

export interface CreateTaskDTO {
    status_id: string;
    title: string;
    description?: string | null;
    priority?: 'low' | 'medium' | 'high' | 'blocker';
    assignee_id?: string | null;
}

export interface UpdateTaskDTO {
    title?: string;
    description?: string | null;
    priority?: 'low' | 'medium' | 'high' | 'blocker';
    status_id?: string;
    assignee_id?: string | null;
    due_date?: string | null;
    category_id?: string | null;
    story_points?: number | null;
    time_estimate?: number | null;
    time_spent?: number | null;
}

export interface WPTaskCategory {
    id: string;
    project_id: string;
    name: string;
    description?: string | null;
    color: string;
    created_at: string;
}

export interface WorkspaceMemberProfile {
    user_id: string;
    role: string;
    display_name: string;
    avatar_url: string | null;
    username: string;
}

export interface WorkspaceState {
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    projects: WPProject[];
    currentProject: WPProject | null;
    members: WorkspaceMemberProfile[];
    taskComments: any[];
    projectTags: any[];
    taskTags: any[];
    taskChecklist: any[];
    taskAttachments: any[];
    projectCategories: WPTaskCategory[];
    board: {
        project: WPProject;
        statuses: WPStatus[];
        tasks: WPTask[];
    } | null;
    loading: boolean;
    error: string | null;
}
