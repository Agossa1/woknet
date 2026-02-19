-- Identifiants uniques : Génère des UUID v4 (ex: 550e8400-e29b...) au lieu d'ID simples (1, 2, 3)
-- Sécurise tes URLs en empêchant de deviner le nombre d'utilisateurs ou de posts.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Géolocalisation : Permet de stocker des coordonnées GPS et de faire des calculs de distance.
-- Idéal pour les fonctions "Amis à proximité" ou "Posts locaux".
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Cryptographie : Ajoute des fonctions de hachage et de chiffrement directement en SQL.
-- Utile pour sécuriser certaines données sensibles au niveau de la base.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Recherche floue : Compare les chaînes de caractères par "trigrammes".
-- Permet de trouver des résultats même si l'utilisateur fait une faute de frappe (ex: "Jhon" -> "John").
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- IA & Recommandations : Gère les vecteurs pour l'Intelligence Artificielle.
-- Utilisé pour suggérer du contenu similaire (photos, textes) via des algorithmes de machine learning.
CREATE EXTENSION IF NOT EXISTS "pgvector";      

-- Graphe (Social Graph) : Permet de gérer des relations complexes (amis d'amis, réseau pro).
-- Ajoute la puissance d'une base de données orientée graphe (type Neo4j) dans PostgreSQL.
CREATE EXTENSION IF NOT EXISTS "age";            

-- Recherche multilingue : Moteur de recherche plein texte ultra-rapide.
-- Supporte toutes les langues (indispensable si ton réseau est international).
CREATE EXTENSION IF NOT EXISTS "pgroonga";

-- Séries temporelles : Optimise le stockage des données qui dépendent du temps.
-- Parfait pour l'historique des notifications, les logs d'activité ou les statistiques de vues.
CREATE EXTENSION IF NOT EXISTS "timescaledb";

-- Mise à l'échelle (Scaling) : Permet de distribuer tes données sur plusieurs serveurs.
-- Crucial quand ton réseau social commence à avoir des millions d'utilisateurs.
CREATE EXTENSION IF NOT EXISTS "citus";

-- Monitoring de performance : Enregistre les statistiques de toutes les requêtes SQL exécutées.
-- Aide à identifier et corriger les requêtes lentes qui font ramer ton application.
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";





-- Create ENUM types (safe checks) - ensure names match columns below
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('USER','SUPERADMIN','ADMIN','MODERATEUR','ASSISTANT');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_type') THEN
        CREATE TYPE job_type AS ENUM (
            'FULL_TIME','PART_TIME','PERMANENT','FIXED_TERM','TEMPORARY',
            'FREELANCE','SELF_EMPLOYED','INTERNSHIP','APPRENTICESHIP','REMOTE','VOLUNTEER'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'place_type') THEN
        CREATE TYPE place_type AS ENUM (
            'ONSITE','HYBRID','REMOTE','MOBILE','TRAVEL_BASED','OFFSHORE','COWORKING','FLEXIBLE'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'degree_level') THEN
        CREATE TYPE degree_level AS ENUM (
            'HIGH_SCHOOL','BACHELOR','MASTER','DOCTORATE','CERTIFICATION','SELF_TAUGHT','OTHER'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_level') THEN
        CREATE TYPE skill_level AS ENUM ('BEGINNER','INTERMEDIATE','ADVANCED','EXPERT');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_link_type') THEN
        CREATE TYPE project_link_type AS ENUM (
            'GITHUB','BEHANCE','DRIBBBLE','GOOGLE_DOCS','GOOGLE_DRIVE','CANVA','EXTERNAL_WEBSITE','OTHER'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_role') THEN
        CREATE TYPE company_role AS ENUM ('ADMIN','RECRUITER','EDITOR');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
        CREATE TYPE job_status AS ENUM ('DRAFT','PUBLISHED','CLOSED','ARCHIVED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_type') THEN
        CREATE TYPE post_type AS ENUM ('TEXT','IMAGE','VIDEO','DOCUMENT','LINK');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_visibility') THEN
        CREATE TYPE post_visibility AS ENUM ('PUBLIC','CONNECTIONS','PRIVATE');
    END IF;
END$$;










-- 1. S'assurer que les types ENUMS existent
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('USER', 'RECRUITER', 'ADMIN', 'MODERATOR');
    END IF;
END $$;

-- 2. Création de la table Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(255), -- Optionnel selon la méthode de login
    password_hash VARCHAR(255) NOT NULL,
    
    -- État du compte
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    has_onboarded BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Sécurité & OTP
    otp_code VARCHAR(255),
    otp_expires_at TIMESTAMP,
    otp_hashed TEXT,
    reset_token TEXT,
    
    -- Tracking & Audit
    registration_ip VARCHAR(255),
    last_login_ip VARCHAR(255),
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Données de base (Copie rapide pour le matching initial)
    job_title VARCHAR(255),
    city VARCHAR(255),
    country VARCHAR(255),
    
    -- Droits
    roles user_role[] NOT NULL DEFAULT ARRAY['USER']::user_role[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

---
--- INDEXATION STRATÉGIQUE
---

-- Accélère le Login (insensible à la casse)
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));

-- Recherche rapide par nom (Trigramme pour l'autocomplétion)
CREATE INDEX IF NOT EXISTS idx_users_full_name_trgm ON users USING GIN (full_name gin_trgm_ops);

-- Index partiel pour les utilisateurs actifs (Optimise les scans de la plateforme)
CREATE INDEX IF NOT EXISTS idx_users_active_valid ON users (id) 
WHERE is_active = TRUE AND deleted_at IS NULL;

---
--- AUTOMATISATION
---

-- Trigger pour updated_at
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();





-- S'assurer que l'extension pour la recherche textuelle floue est active
CREATE EXTENSION IF NOT EXISTS pg_trgm;

DROP TABLE IF EXISTS profiles CASCADE;









CREATE TABLE profiles (
    -- IDENTITÉ & LIENS
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    banner_url TEXT,
    bio TEXT,
    website VARCHAR(255),
    
    -- LOCALISATION
    location_coords POINT,
    location_name VARCHAR(255),

    -- EXPERTISE & SOCIAL (Le moteur de visibilité)
    headline VARCHAR(255), -- Titre pro (ex: Senior Fullstack Dev)
    skills TEXT[] DEFAULT '{}', -- Tags de compétences
    experience_level VARCHAR(50), -- Junior, Middle, Senior
    
    -- MÉTRIQUES D'INFLUENCE
    follower_count INTEGER DEFAULT 0,
    project_count INTEGER DEFAULT 0,
    reputation_score FLOAT DEFAULT 0.0, -- ✨ Le "Hot Score" du talent
    
    -- ÉTAT
    is_open_to_work BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE, -- Badge de confiance
    
    -- AUDIT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

---
--- INDEXATION
---

-- Index spatial pour trouver des talents à proximité (ex: "Développeurs à Paris")
CREATE INDEX idx_profiles_location ON profiles USING GIST (location_coords);

-- Index pour la recherche de pseudos (auto-complétion)
CREATE INDEX idx_profile_username_trgm ON profiles USING GIN (username gin_trgm_ops);

-- Index pour le matching par compétences
CREATE INDEX idx_profiles_skills ON profiles USING GIN (skills);

-- Index pour le classement des talents dans le feed
CREATE INDEX idx_profiles_reputation ON profiles(reputation_score DESC);

---
--- INTELLIGENCE (Le Reputation Engine)
---

CREATE OR REPLACE FUNCTION update_talent_reputation() RETURNS trigger AS $$
BEGIN
    -- Formule de réputation : 
    -- (Nombre de followers * 5) + (Nombre de projets * 10) + (Si vérifié + 100)
    NEW.reputation_score := (NEW.follower_count * 5) + (NEW.project_count * 10) + 
                            (CASE WHEN NEW.is_verified THEN 100 ELSE 0 END);
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_talent_reputation
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_talent_reputation();

-- Trigger standard pour updated_at
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE OR REPLACE FUNCTION update_post_intelligence() RETURNS trigger AS $$
DECLARE
    age_hours FLOAT;
BEGIN
    -- A. Calcul du vecteur de recherche (Search Vector)
    NEW.search_vector := to_tsvector('french', coalesce(NEW.content, ''));

    -- B. Calcul du Hot Score
    -- On donne beaucoup de poids aux partages et commentaires
    SELECT EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - NEW.created_at))/3600 INTO age_hours;
    NEW.hot_score := (NEW.likes_count * 2 + NEW.comments_count * 5 + NEW.shares_count * 10) 
                     / POWER((age_hours + 2), 1.8);

    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_post_intelligence
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_post_intelligence();












CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    
    -- CONTENU
    content TEXT,
    type post_type DEFAULT 'TEXT',
    visibility post_visibility DEFAULT 'PUBLIC',
    tags VARCHAR(50)[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}', -- ✨ Pour les previews de liens (title, description, site_name)
    
    -- MEDIA
    media_url TEXT,
    thumbnail_url TEXT,
    
    -- STATS (Dénormalisées pour la vitesse)
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    hot_score FLOAT DEFAULT 0.0, -- ✨ Le moteur du feed
    
    -- RECHERCHE & DATES
    search_vector tsvector,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXATION
CREATE INDEX IF NOT EXISTS idx_posts_profile_id ON posts(profile_id);
CREATE INDEX IF NOT EXISTS idx_posts_hot_score ON posts(hot_score DESC) WHERE visibility = 'PUBLIC';
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON posts USING GIN (search_vector);

-- TRIGGER UPDATED_AT
CREATE TRIGGER trg_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();





-- 1. S'assurer que les types ENUM existent
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_type') THEN
        CREATE TYPE job_type AS ENUM ('FULL_TIME', 'PART_TIME', 'FREELANCE', 'INTERNSHIP', 'CONTRACT');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'place_type') THEN
        CREATE TYPE place_type AS ENUM ('ONSITE', 'REMOTE', 'HYBRID');
    END IF;
END $$;

-- 2. Création de la table
CREATE TABLE IF NOT EXISTS experiences (
    -- IDENTITÉ
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    
    -- POSTE ET ENTREPRISE
    title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL, -- Pour lier à une page entreprise officielle
    
    -- CONFIGURATION DU POSTE
    type_job job_type DEFAULT 'FULL_TIME',
    type_place place_type DEFAULT 'ONSITE',
    
    -- LOCALISATION
    country_code CHAR(2), -- Code ISO (FR, US, BE)
    city VARCHAR(100) NOT NULL,
    
    -- EXPERTISE (Le cœur du matching)
    description TEXT,
    skills_used TEXT[] DEFAULT '{}', -- ✨ Tableau de compétences (ex: ['React', 'Node.js'])
    
    -- DATES ET CALCULS
    start_date DATE NOT NULL,
    end_date DATE, 
    is_current BOOLEAN DEFAULT FALSE,
    duration_months INTEGER DEFAULT 0, -- ✨ Calculé automatiquement pour l'algorithme
    
    -- RÉMUNÉRATION (Optionnel/Privé)
    salary_amount NUMERIC,
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- AUDIT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- SÉCURITÉ : La date de fin doit être cohérente
    CONSTRAINT check_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

---
--- INDEXATION POUR LA PERFORMANCE
---

CREATE INDEX IF NOT EXISTS idx_exp_profile_id ON experiences(profile_id);
CREATE INDEX IF NOT EXISTS idx_exp_company_name ON experiences(company_name);
-- Index GIN pour permettre de chercher : "Qui a déjà travaillé avec React ?"
CREATE INDEX IF NOT EXISTS idx_exp_skills ON experiences USING GIN (skills_used);

---
--- INTELLIGENCE (Trigger de calcul de durée)
---










CREATE OR REPLACE FUNCTION calculate_experience_duration()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcul de la durée en mois entre start_date et (end_date ou aujourd'hui)
    IF NEW.is_current OR NEW.end_date IS NULL THEN
        NEW.duration_months := (EXTRACT(year FROM age(CURRENT_DATE, NEW.start_date)) * 12) +
                                EXTRACT(month FROM age(CURRENT_DATE, NEW.start_date));
    ELSE
        NEW.duration_months := (EXTRACT(year FROM age(NEW.end_date, NEW.start_date)) * 12) +
                                EXTRACT(month FROM age(NEW.end_date, NEW.start_date));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_duration
    BEFORE INSERT OR UPDATE ON experiences
    FOR EACH ROW
    EXECUTE FUNCTION calculate_experience_duration();

-- Trigger standard pour updated_at
CREATE TRIGGER trg_experiences_updated_at
    BEFORE UPDATE ON experiences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();






-- 1. S'assurer que le type ENUM pour les diplômes existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'degree_level') THEN
        CREATE TYPE degree_level AS ENUM (
            'HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'PHD', 'BOOTCAMP', 'OTHER'
        );
    END IF;
END $$;

-- 2. Création de la table
CREATE TABLE IF NOT EXISTS educations (
    -- IDENTITÉ
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    
    -- INSTITUTION ET DIPLÔME
    school_name VARCHAR(255) NOT NULL,
    degree degree_level DEFAULT 'BACHELOR',
    field_of_study VARCHAR(255), -- ex: 'Génie Logiciel', 'Design Graphique'
    
    -- DATES ET ÉTAT
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    
    -- CONTENU ET COMPÉTENCES ACQUISES
    description TEXT,
    location VARCHAR(255),
    skills_acquired TEXT[] DEFAULT '{}', -- ✨ Remplacer stack par un tableau pour le matching
    
    -- AUDIT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- SÉCURITÉ
    CONSTRAINT check_edu_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

---
--- INDEXATION
---

CREATE INDEX IF NOT EXISTS idx_edu_profile_id ON educations(profile_id);
CREATE INDEX IF NOT EXISTS idx_edu_school ON educations(school_name);
-- Index pour le filtrage par niveau d'études
CREATE INDEX IF NOT EXISTS idx_edu_degree ON educations(degree);
-- Index GIN pour les compétences apprises durant les études
CREATE INDEX IF NOT EXISTS idx_edu_skills ON educations USING GIN (skills_acquired);

---
--- AUTOMATISATION
---

-- Trigger standard pour updated_at
CREATE TRIGGER trg_educations_updated_at
    BEFORE UPDATE ON educations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();



-- 1. S'assurer que le type ENUM existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_level') THEN
        CREATE TYPE skill_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');
    END IF;
END $$;

-- 2. Table de référence des compétences
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255), -- ex: 'Design', 'Développement', 'Marketing'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_skills_name_trgm ON skills USING GIN (name gin_trgm_ops);

-- 3. Table de liaison (Le set de skills d'un utilisateur)
CREATE TABLE IF NOT EXISTS profile_skills (
    profile_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    
    level skill_level DEFAULT 'INTERMEDIATE',
    endorsements_count INTEGER DEFAULT 0, -- Mis à jour par trigger
    
    PRIMARY KEY (profile_id, skill_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profile_skills_pid ON profile_skills(profile_id);

-- 4. Table des recommandations (Endorsements)
CREATE TABLE IF NOT EXISTS skill_endorsements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    skill_id UUID NOT NULL,
    endorser_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    
    FOREIGN KEY (profile_id, skill_id) REFERENCES profile_skills(profile_id, skill_id) ON DELETE CASCADE,
    UNIQUE (profile_id, skill_id, endorser_id), -- Un seul vote par personne par compétence
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

---
--- INTELLIGENCE : Sync du compteur de votes
---

CREATE OR REPLACE FUNCTION update_endorsement_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE profile_skills 
        SET endorsements_count = endorsements_count + 1
        WHERE profile_id = NEW.profile_id AND skill_id = NEW.skill_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE profile_skills 
        SET endorsements_count = endorsements_count - 1
        WHERE profile_id = OLD.profile_id AND skill_id = OLD.skill_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_endorsements
AFTER INSERT OR DELETE ON skill_endorsements
FOR EACH ROW EXECUTE FUNCTION update_endorsement_count();














CREATE TABLE IF NOT EXISTS project_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,  
    slug VARCHAR(100) UNIQUE NOT NULL   
);

-- Extension pour les UUID si pas déjà fait
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Création de l'Enum pour les liens
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_link_type') THEN
        CREATE TYPE project_link_type AS ENUM ('BEHANCE', 'DRIBBBLE', 'GITHUB', 'GITLAB', 'FIGMA', 'NOTION', 'PERSONAL_SITE', 'OTHER');
    END IF;
END $$;

-- Fonction générique pour updated_at (si elle n'existe pas déjà)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS projects (
    -- IDENTITÉ
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    category_id UUID REFERENCES project_categories(id) ON DELETE SET NULL,  
    
    -- CONTENU
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}', -- Pour booster la créativité thématique (#UI, #Web3)
    
    -- LIENS ET PORTFOLIO
    presentation_url TEXT NOT NULL, 
    link_platform project_link_type DEFAULT 'OTHER',
    repository_url TEXT, 
    thumbnail_url TEXT, 
    
    -- ÉTAT ET DATES
    is_ongoing BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE, -- Mise en avant manuelle par l'utilisateur
    start_date DATE,
    completion_date DATE,
    
    -- PERFORMANCE & VISIBILITÉ (Le moteur du feed)
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    hot_score FLOAT DEFAULT 0.0, -- Score dynamique pour l'algorithme
    search_vector tsvector, -- Pour la recherche ultra-rapide
    
    -- AUDIT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- A. Algorithme de Ranking (Hot Score)
CREATE OR REPLACE FUNCTION calculate_project_hot_score()
RETURNS TRIGGER AS $$
DECLARE
    age_hours FLOAT;
BEGIN
    SELECT EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - NEW.created_at))/3600 INTO age_hours;
    -- Formule: Plus c'est liké et récent, plus le score est haut
    NEW.hot_score := (NEW.like_count * 10 + NEW.view_count) / POWER((age_hours + 2), 1.5);
    
    -- Mise à jour du vecteur de recherche par la même occasion
    NEW.search_vector := to_tsvector('french', coalesce(NEW.title, '') || ' ' || coalesce(NEW.description, ''));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- B. Application des Triggers
CREATE TRIGGER trg_projects_hot_score
    BEFORE INSERT OR UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION calculate_project_hot_score();

CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Le "Boss" de l'espace entreprise
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50) UNIQUE, -- Pour vérifier que c'est une vraie entreprise (ex: IFU au Bénin)
    is_verified BOOLEAN DEFAULT FALSE, -- Badge de confiance
    
    logo_url TEXT,
    banner_url TEXT,
    description TEXT,
    website_url TEXT,
    
    -- Pour la sécurité : on trace qui a créé l'espace
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour retrouver l'entreprise d'un utilisateur instantanément
CREATE INDEX idx_company_owner ON companies(owner_id);

-- Performance des requêtes de base
CREATE INDEX idx_projects_profile ON projects(profile_id);
CREATE INDEX idx_projects_category ON projects(category_id);
CREATE INDEX idx_projects_platform ON projects(link_platform);

-- Performance du Feed (Tri par puissance)
CREATE INDEX idx_projects_hot_score ON projects(hot_score DESC);

-- Performance de la recherche et des tags
CREATE INDEX idx_projects_tags ON projects USING GIN (tags);
CREATE INDEX idx_projects_search ON projects USING GIN (search_vector);


CREATE TABLE IF NOT EXISTS company_members (
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role company_role DEFAULT 'RECRUITER',
    
    PRIMARY KEY (company_id, user_id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- LIAISONS
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Si le recruteur part, l'annonce reste (nullable pour SET NULL)
    
    -- CONTENU
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT, -- Optionnel : pour lister les compétences à part
    
    -- PARAMÈTRES
    status job_status DEFAULT 'DRAFT',
    is_featured BOOLEAN DEFAULT false, -- Pour mettre en avant certaines annonces (optionnel)
    
    -- TIMESTAMPS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE -- Date de fin de publication automatique
);

-- 3. INDEX POUR LA PERFORMANCE (Crucial pour un job board)
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status) WHERE status = 'PUBLISHED'; -- Index partiel pour les recherches actives
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at DESC); -- Pour afficher les plus récents en premier
 

 -- 1. FOLLOWS (Abonnements)
-- Inchangée, elle est déjà très bien structurée.
CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    following_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT cannot_follow_self CHECK (follower_id <> following_id)
);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_follows_follower ON follows(follower_id); -- Ajouté pour voir qui je suis

-- 2. LIKES (Mentions J'aime)
CREATE TABLE IF NOT EXISTS likes (
    profile_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Pas besoin d'un ID UUID ici, la clé composite suffit et économise de la place
    PRIMARY KEY (profile_id, post_id) 
);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);

-- 3. COMMENTS (Commentaires & Réponses)
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Pour les réponses
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_comments_post_id ON comments(post_id);
-- Index filtré pour trouver les réponses à un commentaire précis
CREATE INDEX idx_comments_replies ON comments(parent_id) WHERE parent_id IS NOT NULL;

-- 4. SHARES (Partages / Reposts)
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    caption TEXT, -- Le message ajouté par celui qui partage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Index pour voir combien de fois un post a été partagé
CREATE INDEX idx_shares_post_id ON shares(post_id);

-- 5. SAVES (Enregistrements privés)
CREATE TABLE IF NOT EXISTS saves (
    profile_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (profile_id, post_id)
);
-- Index pour retrouver ses propres sauvegardes par date décroissante
CREATE INDEX idx_saves_profile_date ON saves(profile_id, created_at DESC);


