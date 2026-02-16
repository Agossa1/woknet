-- ==========================================
-- ARCHITECTURE DE RECOMMANDATION WORKNET (MULTI-LAYER)
-- ==========================================

-- 1. COUCHE "SIGNAUX" (Raw Signals)
-- Capture tous les événements utilisateurs bruts pour nourrir les algos
-- (Vue, Clic, Temps passé, Scroll, Recherche...)
CREATE TABLE IF NOT EXISTS user_signals (
    signal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    
    -- L'objet concerné
    item_id UUID NOT NULL,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('POST', 'JOB', 'USER', 'COMPANY', 'SKILL', 'COMMUNITY')),
    
    -- Le type d'action
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('VIEW', 'CLICK', 'LIKE', 'COMMENT', 'SHARE', 'SAVE', 'DISMISS', 'SEARCH', 'APPLY', 'CONNECT')),
    
    -- Métadonnées riches (JSONB pour flexibilité maximale)
    -- ex: { "duration_ms": 5000, "scroll_depth": 0.8, "source": "feed" }
    metadata JSONB DEFAULT '{}',
    
    weight FLOAT DEFAULT 1.0, -- Importance du signal (ex: CLICK=1, APPLY=10)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour l'analyse rapide (Time-Series like)
CREATE INDEX idx_signals_user_time ON user_signals (user_id, created_at DESC);
CREATE INDEX idx_signals_item ON user_signals (item_id, action_type);


-- 2. COUCHE "STRATÉGIES" (Algorithm Registry)
-- Définit les différents moteurs de recommandation actifs
CREATE TABLE IF NOT EXISTS recommendation_strategies (
    strategy_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE, -- ex: "trending_posts_v1", "similar_profiles_knn"
    description TEXT,
    
    -- Configuration de l'algo (Poids, Seuils, Filtres...)
    config JSONB DEFAULT '{}',
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. COUCHE "CANDIDATS" (Generated Candidates)
-- Stocke les résultats pré-calculés par stratégies
-- C'est ici que les workers (Python/Node) déversent leurs calculs
CREATE TABLE IF NOT EXISTS recommendation_candidates (
    candidate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    strategy_id UUID NOT NULL REFERENCES recommendation_strategies(strategy_id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Pour qui ?
    item_id UUID NOT NULL, -- Quoi ?
    item_type VARCHAR(20) NOT NULL,
    
    raw_score FLOAT NOT NULL, -- Score brut de l'algo (0.0 - 1.0)
    explanation JSONB, -- Debug info de l'algo
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL -- Durée de vie courte (Cache)
);
CREATE INDEX idx_candidates_user ON recommendation_candidates(user_id, raw_score DESC);


-- 4. COUCHE "PRÉSENTATION" (Final Feed)
-- La table finale qui est servie à l'utilisateur (Fusion des candidats + Règles métier + Filtrage)
CREATE TABLE IF NOT EXISTS recommendations (
    recommendation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID NOT NULL,
    item_id UUID NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    
    -- Le score final après mixage et règles métier
    final_score FLOAT NOT NULL CHECK (final_score >= 0),
    
    -- Traçabilité (Quelle stratégie a gagné ?)
    source_strategy_id UUID REFERENCES recommendation_strategies(strategy_id),
    
    -- UX : Pourquoi on montre ça ?
    display_reason VARCHAR(255), 
    
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'seen', 'converted', 'dismissed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index composite optimisé pour le Feed (Lecture ultra-rapide)
CREATE UNIQUE INDEX uq_recommendations_user_item ON recommendations (user_id, item_id, item_type);
CREATE INDEX idx_recommendations_feed ON recommendations (user_id, final_score DESC) WHERE status = 'active';

-- Fonctions utiles
CREATE OR REPLACE FUNCTION cleanup_old_candidates() RETURNS void AS $$
BEGIN
    DELETE FROM recommendation_candidates WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
