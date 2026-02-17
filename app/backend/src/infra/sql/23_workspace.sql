-- ==========================================
-- WORKSPACES & WORKFLOW MANAGEMENT SYSTEM (WP_ PREFIX)
-- Version sécurisée : Évite les conflits avec la table 'projects' existante.
-- ==========================================

-- ==========================================
-- 0. TYPES ÉNUMÉRÉS (SÉCURITÉ)
-- ==========================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workspace_role') THEN
        CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'member', 'viewer');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wp_task_priority') THEN
        CREATE TYPE wp_task_priority AS ENUM ('low', 'medium', 'high', 'blocker');
    END IF;
END$$;

-- ==========================================
-- 1. STRUCTURE DES ESPACES ET ACCÈS
-- ==========================================

CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT workspace_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE TABLE IF NOT EXISTS workspace_members (
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role workspace_role DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (workspace_id, user_id)
);

-- ==========================================
-- 2. PROJETS DE TRAVAIL, WORKFLOW ET CATÉGORIES
-- ==========================================

CREATE TABLE IF NOT EXISTS wp_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    key_prefix VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT wp_project_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT wp_project_key_uppercase CHECK (key_prefix = UPPER(key_prefix)),
    CONSTRAINT wp_project_key_format CHECK (key_prefix ~ '^[A-Z]{2,10}$'),
    
    UNIQUE (workspace_id, key_prefix)
);

CREATE TABLE IF NOT EXISTS wp_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES wp_projects(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    position INTEGER NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT wp_status_label_not_empty CHECK (LENGTH(TRIM(label)) > 0),
    CONSTRAINT wp_status_position_positive CHECK (position >= 0),
    CONSTRAINT wp_status_color_hex CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    
    UNIQUE (project_id, position),
    UNIQUE (project_id, label)
);

CREATE TABLE IF NOT EXISTS wp_task_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES wp_projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT wp_category_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT wp_category_color_hex CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    
    UNIQUE (project_id, name)
);

CREATE TABLE IF NOT EXISTS wp_sprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES wp_projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    goal TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT wp_sprint_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT wp_sprint_dates_valid CHECK (end_date >= start_date)
);

-- Note: La contrainte unique sur un seul sprint actif par projet est gérée par index partiel plus bas.

-- ==========================================
-- 3. TÂCHES, ÉTIQUETTES ET COLLABORATION
-- ==========================================

CREATE TABLE IF NOT EXISTS wp_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES wp_projects(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES wp_sprints(id) ON DELETE SET NULL,
    status_id UUID NOT NULL REFERENCES wp_statuses(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES wp_task_categories(id) ON DELETE SET NULL,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    task_number INTEGER NOT NULL,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority wp_task_priority DEFAULT 'medium',
    
    story_points INTEGER,
    time_estimate INTEGER, -- En minutes
    time_spent INTEGER DEFAULT 0, -- En minutes
    
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT wp_task_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
    
    UNIQUE (project_id, task_number)
);

CREATE TABLE IF NOT EXISTS wp_task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES wp_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wp_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES wp_projects(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#10B981',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (project_id, name)
);

CREATE TABLE IF NOT EXISTS wp_task_tags (
    task_id UUID REFERENCES wp_tasks(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES wp_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- ==========================================
-- 4. TRIGGERS (AUTOMATISATION)
-- ==========================================

-- Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_wp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Application aux tables concernées
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables 
             WHERE table_name IN ('workspaces', 'wp_projects', 'wp_sprints', 'wp_tasks', 'wp_task_comments')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS tr_update_%I_at ON %I', t, t);
        EXECUTE format('CREATE TRIGGER tr_update_%I_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_wp_updated_at()', t, t);
    END LOOP;
END$$;

-- Numérotation automatique des tâches par projet
CREATE OR REPLACE FUNCTION set_wp_task_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.task_number IS NULL THEN
        SELECT COALESCE(MAX(task_number), 0) + 1
        INTO NEW.task_number
        FROM wp_tasks
        WHERE project_id = NEW.project_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_set_wp_task_number ON wp_tasks;
CREATE TRIGGER tr_set_wp_task_number
    BEFORE INSERT ON wp_tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_wp_task_number();

-- ==========================================
-- 5. INDEXATION (OPTIMISÉE)
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_wp_wm_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_wp_proj_ws ON wp_projects(workspace_id);

CREATE INDEX IF NOT EXISTS idx_wp_tasks_proj ON wp_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_wp_tasks_stat ON wp_tasks(status_id);
CREATE INDEX IF NOT EXISTS idx_wp_tasks_spr ON wp_tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_wp_tasks_assign ON wp_tasks(assignee_id);

-- Un seul sprint actif par projet
CREATE UNIQUE INDEX IF NOT EXISTS idx_wp_sprints_active ON wp_sprints(project_id) WHERE is_active = TRUE;

-- Recherche plein texte
CREATE INDEX IF NOT EXISTS idx_wp_tasks_title_trgm ON wp_tasks USING GIN (title gin_trgm_ops);

-- ==========================================
-- 6. VUE DE SYNTHÈSE
-- ==========================================

CREATE OR REPLACE VIEW v_wp_tasks_details AS
SELECT 
    t.id,
    p.key_prefix || '-' || t.task_number AS task_key,
    t.title,
    t.priority,
    s.label AS status,
    s.color AS status_color,
    u.full_name AS assignee,
    c.name AS category,
    sp.name AS sprint
FROM wp_tasks t
JOIN wp_projects p ON t.project_id = p.id
JOIN wp_statuses s ON t.status_id = s.id
LEFT JOIN users u ON t.assignee_id = u.id
LEFT JOIN wp_task_categories c ON t.category_id = c.id
LEFT JOIN wp_sprints sp ON t.sprint_id = sp.id;

CREATE OR REPLACE VIEW v_wp_project_stats AS
SELECT 
    p.id AS project_id,
    p.name AS project_name,
    COUNT(t.id) AS total_tasks,
    COUNT(t.id) FILTER (WHERE t.completed_at IS NOT NULL) AS completed_tasks,
    COALESCE(SUM(t.story_points), 0) AS total_story_points,
    COALESCE(SUM(t.time_spent), 0) AS total_time_spent
FROM wp_projects p
LEFT JOIN wp_tasks t ON p.id = t.project_id
GROUP BY p.id, p.name;