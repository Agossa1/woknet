-- ==========================================
-- ARCHITECTURE DE RECOMMANDATION WORKNET (MULTI-LAYER)
-- ==========================================

-- 1. COUCHE "SIGNAUX" (Raw Signals)
-- Capture tous les événements utilisateurs bruts pour nourrir les algos
-- (Vue, Clic, Temps passé, Scroll, Recherche...)
-- Extension nécessaire pour les UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS user_signals (
    signal_id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_id UUID, 
    
    -- Détails de l'item
    item_id UUID NOT NULL,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('POST', 'JOB', 'USER', 'COMPANY', 'SKILL', 'COMMUNITY')),
    
    -- Type d'action et poids associé
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('VIEW', 'CLICK', 'LIKE', 'COMMENT', 'SHARE', 'SAVE', 'DISMISS', 'SEARCH', 'APPLY', 'CONNECT')),
    weight FLOAT DEFAULT 1.0, 
    
    -- Métadonnées riches (ex: temps de lecture, position dans le feed)
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (signal_id, created_at)
) PARTITION BY RANGE (created_at);

-- Index GIN pour les recherches dans les métadonnées
CREATE INDEX idx_signals_meta ON user_signals USING GIN (metadata);
CREATE INDEX idx_signals_user_lookup ON user_signals (user_id, action_type);


-- 2. COUCHE "STRATÉGIES" (Algorithm Registry)
-- Définit les différents moteurs de recommandation actifs
CREATE TABLE IF NOT EXISTS recommendation_strategies (
    strategy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE, 
    description TEXT,
    
    -- Poids global de la stratégie dans le mix final
    global_weight FLOAT DEFAULT 1.0, 
    
    -- Marqueur pour booster la découverte (Visibilité/Créativité)
    is_exploration BOOLEAN DEFAULT FALSE,
    
    -- Configuration technique (ex: { "decay_factor": 0.8 })
    config JSONB DEFAULT '{}',
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. COUCHE "CANDIDATS" (Generated Candidates)
-- Stocke les résultats pré-calculés par stratégies
-- C'est ici que les workers (Python/Node) déversent leurs calculs
CREATE TABLE IF NOT EXISTS recommendation_candidates (
    candidate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID NOT NULL REFERENCES recommendation_strategies(strategy_id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    item_id UUID NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    
    -- Score brut de l'algorithme (ex: 0.98)
    raw_score FLOAT NOT NULL, 
    
    -- Information pour le "Mixer" (ex: 'trending', 'nearby', 'affinity')
    reason_code VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL 
);

-- Index pour accélérer le nettoyage des données périmées
CREATE INDEX idx_candidates_cleanup ON recommendation_candidates (expires_at);
-- Index pour le worker qui remplit le feed final
CREATE INDEX idx_candidates_retrieval ON recommendation_candidates (user_id, raw_score DESC);


-- 4. COUCHE "PRÉSENTATION" (Final Feed)
-- La table finale qui est servie à l'utilisateur (Fusion des candidats + Règles métier + Filtrage)
CREATE TABLE IF NOT EXISTS recommendations (
    recommendation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    item_id UUID NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    
    -- Score final après pondération et règles métier
    final_score FLOAT NOT NULL,
    
    -- Référence de la stratégie gagnante
    source_strategy_id UUID REFERENCES recommendation_strategies(strategy_id),
    
    -- Traduction UX (ex: 'matching_skills', 'rising_creator')
    display_reason_key VARCHAR(100), 
    
    -- Gestion du cycle de vie
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'seen', 'clicked', 'dismissed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_user_item UNIQUE (user_id, item_id)
);

-- Index ultra-performant pour charger le feed
CREATE INDEX idx_recommendations_active_feed ON recommendations (user_id, final_score DESC) 
WHERE status = 'active';

-- Fonctions utiles
CREATE OR REPLACE FUNCTION public.prune_recommendation_data()
RETURNS void AS $$
BEGIN
    -- 1. Supprimer les candidats expirés
    DELETE FROM recommendation_candidates WHERE expires_at < NOW();
    
    -- 2. Archiver ou supprimer les vieilles recommandations vues (plus de 7 jours)
    DELETE FROM recommendations WHERE status != 'active' AND updated_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;