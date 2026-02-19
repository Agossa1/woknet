-- ==========================================
-- FEED CONTENT SCORING SYSTEM (PHASE 1)
-- ==========================================
-- Stocke les scores multi-facteurs pour personnaliser le feed

CREATE TABLE IF NOT EXISTS feed_content_scoring (
    scoring_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL,
    user_viewing UUID NOT NULL,
    
    -- Facteurs de contenu (0-100)
    creativity_score FLOAT DEFAULT 0,
    opportunity_score FLOAT DEFAULT 0,
    talent_showcase_score FLOAT DEFAULT 0,
    viral_potential_score FLOAT DEFAULT 0,
    
    -- Contexte utilisateur
    relevance_to_user_skills FLOAT DEFAULT 0,
    community_boost_factor FLOAT DEFAULT 1.0,
    location_boost_factor FLOAT DEFAULT 1.0,
    
    -- Score final pondéré
    final_rank_score FLOAT NOT NULL,
    
    -- Metadata pour audit
    scoring_metadata JSONB DEFAULT '{}',
    
    -- Lifecycle
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 hour'),
    
    UNIQUE (item_id, user_viewing),
    FOREIGN KEY (item_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Index pour recherche rapide du classement (sans condition NOW)
CREATE INDEX idx_feed_scoring_rank 
ON feed_content_scoring (user_viewing, final_rank_score DESC);

-- Index pour invalidation/cleanup
CREATE INDEX idx_feed_scoring_expires 
ON feed_content_scoring (expires_at);

-- Index pour audit
CREATE INDEX idx_feed_scoring_user_calc 
ON feed_content_scoring (user_viewing, calculated_at DESC);

-- Nettoyage automatique des scores expirés
CREATE OR REPLACE FUNCTION cleanup_expired_feed_scores()
RETURNS void AS $$
BEGIN
    DELETE FROM feed_content_scoring 
    WHERE expires_at < NOW() - INTERVAL '2 hours';
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- FEED INTERACTIONS TRACKING (Pour analytics)
-- ==========================================
CREATE TABLE IF NOT EXISTS feed_interactions (
    interaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    
    -- Type d'interaction
    interaction_type VARCHAR(50) NOT NULL 
        CHECK (interaction_type IN ('VIEW', 'SCROLL_PAST', 'HOVER', 'CLICK', 'SHARE', 'SAVE')),
    
    -- Temps passé sur l'item (en millisecondes)
    time_spent_ms INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feed_interactions_user_item 
ON feed_interactions (user_id, item_id, interaction_type);

CREATE INDEX idx_feed_interactions_created 
ON feed_interactions (created_at DESC);

-- ==========================================
-- VIEW pour maintenir la compatibilité
-- ==========================================
-- Sera utilisée par le repository pour les queries
CREATE OR REPLACE VIEW feed_items_with_scoring AS
SELECT 
    p.id as item_id,
    p.profile_id as author_id,
    'POST' as content_type,
    COALESCE(fcs.final_rank_score, p.hot_score, 0) as base_score,
    p.created_at,
    fcs.creativity_score,
    fcs.opportunity_score,
    fcs.talent_showcase_score,
    fcs.relevance_to_user_skills,
    fcs.final_rank_score as personalized_score,
    p.likes_count,
    p.comments_count,
    p.shares_count,
    p.content,
    p.media_url
FROM posts p
LEFT JOIN feed_content_scoring fcs ON (fcs.item_id = p.id);

-- ==========================================
-- INDEXES ADDITIONNELS POUR PERF
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_posts_hot_score ON posts(hot_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
