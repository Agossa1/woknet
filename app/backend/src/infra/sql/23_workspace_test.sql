-- ==========================================
-- TESTS DU SCHÉMA WORKSPACE (PREFIXED)
-- ==========================================

-- Nettoyer les données de test précédentes
TRUNCATE TABLE wp_task_tags, wp_task_comments, wp_tasks, wp_tags, wp_task_categories, wp_statuses, wp_sprints, wp_projects, workspace_members, workspaces CASCADE;

-- ==========================================
-- 1. CRÉER UN WORKSPACE
-- ==========================================

DO $$
DECLARE
    test_user_id UUID;
    test_workspace_id UUID;
    test_project_id UUID;
    test_status_todo_id UUID;
    test_status_doing_id UUID;
    test_status_done_id UUID;
    test_category_backend_id UUID;
    test_sprint_id UUID;
    test_task_1_id UUID;
    test_task_2_id UUID;
    test_tag_bug_id UUID;
BEGIN
    -- Récupérer un utilisateur existant
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'Aucun utilisateur trouvé. Créez d''abord un utilisateur.';
    END IF;

    -- Créer un workspace
    INSERT INTO workspaces (name, description, owner_id, is_private)
    VALUES ('Équipe Dev', 'Workspace de test', test_user_id, true)
    RETURNING id INTO test_workspace_id;

    -- ==========================================
    -- 2. CRÉER UN PROJET
    -- ==========================================

    INSERT INTO wp_projects (workspace_id, name, description, key_prefix)
    VALUES (test_workspace_id, 'API Backend', 'Développement de l''API REST', 'API')
    RETURNING id INTO test_project_id;

    -- ==========================================
    -- 3. CRÉER LES STATUTS (UN PAR UN)
    -- ==========================================

    INSERT INTO wp_statuses (project_id, label, position, color)
    VALUES (test_project_id, 'À faire', 0, '#6B7280')
    RETURNING id INTO test_status_todo_id;

    INSERT INTO wp_statuses (project_id, label, position, color)
    VALUES (test_project_id, 'En cours', 1, '#3B82F6')
    RETURNING id INTO test_status_doing_id;

    INSERT INTO wp_statuses (project_id, label, position, color)
    VALUES (test_project_id, 'Terminé', 2, '#10B981')
    RETURNING id INTO test_status_done_id;

    -- ==========================================
    -- 4. CRÉER DES CATÉGORIES
    -- ==========================================

    INSERT INTO wp_task_categories (project_id, name, description, color)
    VALUES (test_project_id, 'Backend', 'Développement backend', '#EF4444')
    RETURNING id INTO test_category_backend_id;

    -- ==========================================
    -- 5. CRÉER UN SPRINT
    -- ==========================================

    INSERT INTO wp_sprints (project_id, name, start_date, end_date, is_active)
    VALUES (test_project_id, 'Sprint 1', CURRENT_DATE, CURRENT_DATE + 14, true)
    RETURNING id INTO test_sprint_id;

    -- ==========================================
    -- 6. CRÉER DES TÂCHES
    -- ==========================================

    INSERT INTO wp_tasks (
        project_id, sprint_id, status_id, category_id,
        creator_id, assignee_id,
        title, description, priority, story_points
    )
    VALUES (
        test_project_id, test_sprint_id, test_status_todo_id, test_category_backend_id,
        test_user_id, test_user_id,
        'Implémenter login JWT', 'JWT Auth', 'high', 5
    )
    RETURNING id INTO test_task_1_id;

    INSERT INTO wp_tasks (
        project_id, sprint_id, status_id, category_id,
        creator_id, assignee_id,
        title, description, priority, story_points
    )
    VALUES (
        test_project_id, test_sprint_id, test_status_doing_id, test_category_backend_id,
        test_user_id, test_user_id,
        'Middleware Auth', 'Verify JWT tokens', 'medium', 3
    )
    RETURNING id INTO test_task_2_id;

    -- ==========================================
    -- 7. CRÉER DES TAGS
    -- ==========================================

    INSERT INTO wp_tags (project_id, name, color)
    VALUES (test_project_id, 'bug', '#EF4444')
    RETURNING id INTO test_tag_bug_id;

    INSERT INTO wp_task_tags (task_id, tag_id)
    VALUES (test_task_1_id, test_tag_bug_id);

    -- ==========================================
    -- 8. COMMENTAIRES
    -- ==========================================

    INSERT INTO wp_task_comments (task_id, user_id, content)
    VALUES (test_task_1_id, test_user_id, 'Important point');

    -- ==========================================
    -- 9. VALIDATION
    -- ==========================================

    -- Test numérotation
    DECLARE
        task_key TEXT;
    BEGIN
        SELECT p.key_prefix || '-' || t.task_number INTO task_key
        FROM wp_tasks t
        JOIN wp_projects p ON t.project_id = p.id
        WHERE t.id = test_task_1_id;
        
        ASSERT task_key = 'API-1', 'Numérotation auto KO';
    END;

    -- Test stats
    DECLARE
        t_tasks INTEGER;
    BEGIN
        SELECT total_tasks INTO t_tasks FROM v_wp_project_stats WHERE project_id = test_project_id;
        ASSERT t_tasks = 2, 'Stats KO';
    END;

    RAISE NOTICE '=== TOUS LES TESTS SONT PASSÉS ✓ ===';

END $$;

-- AFFICHER LES RÉSULTATS
SELECT * FROM workspaces;
SELECT * FROM wp_projects;
SELECT * FROM v_wp_tasks_details;
SELECT * FROM v_wp_project_stats;
