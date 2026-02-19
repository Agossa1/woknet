-- ==========================================
-- GLOBAL POWER FEED VIEW
-- ==========================================
-- Vue qui agrège tous les posts avec leurs scores
-- Pour maintenir compatibilité avec le code existant

DROP VIEW IF EXISTS global_power_feed CASCADE;

CREATE VIEW global_power_feed AS
SELECT 
    p.id as item_id,
    p.profile_id as author_id,
    'POST' as content_type,
    COALESCE(p.hot_score, (p.likes_count * 2 + p.comments_count * 5)::float, 0.0) as base_score,
    p.created_at
FROM posts p
ORDER BY base_score DESC, p.created_at DESC;
