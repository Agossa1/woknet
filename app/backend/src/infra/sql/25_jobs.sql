-- 25_jobs.sql

-- Drop existing table if it exists
DROP TABLE IF EXISTS jobs CASCADE;

-- Create jobs table
CREATE TABLE jobs (
    -- IDENTITÉ & RELATION
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    
    -- CONTENU & DÉTAILS
    description TEXT,
    requirements TEXT,
    category VARCHAR(100), -- Pour le filtrage thématique
    tags TEXT[] DEFAULT '{}', -- ✨ Pour le matching (ex: #React, #Node, #Remote)
    
    -- LOGISTIQUE
    location VARCHAR(255),
    work_type VARCHAR(50) DEFAULT 'full-time',
    is_remote BOOLEAN DEFAULT FALSE,
    
    -- RÉMUNÉRATION
    salary_min INT,
    salary_max INT,
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- MÉTRIQUES DE PERFORMANCE (Le moteur du feed)
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    hot_score FLOAT DEFAULT 0.0, -- ✨ Score de visibilité pour le feed
    
    -- ÉTAT & RECHERCHE
    status VARCHAR(50) DEFAULT 'draft',
    application_url VARCHAR(500),
    search_vector TSVECTOR,
    
    -- AUDIT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

---
--- INDEXATION
---

CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_slug ON jobs(slug);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_tags ON jobs USING GIN (tags); -- Pour le matching rapide
CREATE INDEX idx_jobs_hot_score ON jobs(hot_score DESC); -- Pour le feed "Opportunités"
CREATE INDEX idx_jobs_search_vector ON jobs USING GIN (search_vector);

---
--- INTELLIGENCE (Triggers)
---

-- 1. Mise à jour automatique du Search Vector & du Hot Score
CREATE OR REPLACE FUNCTION update_job_intelligence() RETURNS trigger AS $$
DECLARE
    age_hours FLOAT;
BEGIN
    -- A. Calcul du Search Vector (Recherche Plein Texte)
    NEW.search_vector := to_tsvector('french', 
        coalesce(NEW.title, '') || ' ' || 
        coalesce(NEW.description, '') || ' ' || 
        coalesce(NEW.requirements, '')
    );

    -- B. Calcul du Hot Score (Algorithme de visibilité)
    -- Formule: (Vues + Candidatures * 5) / (Age + 2)^1.2
    SELECT EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - NEW.created_at))/3600 INTO age_hours;
    NEW.hot_score := (NEW.view_count + NEW.application_count * 5) / POWER((age_hours + 2), 1.2);

    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_job_intelligence
    BEFORE INSERT OR UPDATE ON jobs 
    FOR EACH ROW EXECUTE FUNCTION update_job_intelligence();

-- 2. Trigger standard pour updated_at
CREATE TRIGGER trg_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();