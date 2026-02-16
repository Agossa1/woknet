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

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    headline VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    otp_code VARCHAR(255),
    otp_expires_at TIMESTAMP,
    otp_hashed TEXT,
    access_token VARCHAR(255),
    refresh_token VARCHAR(255),
    reset_token TEXT,
    
    -- Onboarding and Work Profile
    has_onboarded BOOLEAN DEFAULT FALSE,
    industry_id VARCHAR(100), -- References industries(id)
    job_title VARCHAR(255),
    job_type job_type,
    city VARCHAR(255),
    country VARCHAR(255),

    registration_ip VARCHAR(255),
    last_login_ip VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    roles user_role[] NOT NULL DEFAULT ARRAY['USER']::user_role[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

---INDEX pour l'authentification de l'utilisateur

CREATE INDEX IF NOT EXISTS idx_user_email_lower ON users (LOWER(email));

--- Index pour les utilisateurs actifs (id est déjà PK mais on garde un index partiel si besoin)
CREATE INDEX IF NOT EXISTS idx_active_id ON users (id) WHERE is_active = TRUE AND deleted_at IS NULL;

--- INDEX DE RECHERCHES PAR NOM

CREATE INDEX IF NOT EXISTS idx_users_full_name ON users USING GIN (full_name gin_trgm_ops);



CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID UNIQUE REFERENCES users ON DELETE CASCADE,
    username VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url  TEXT,
    banner_url TEXT,
    bio TEXT,
    website VARCHAR(255) NOT NULL,
 

    location_coords POINT,
    location_name VARCHAR(255),

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);

--- INDEXATION POUR LA PERFORMANCE 
--- INDEX SPATIAL POUR LES RECHERCHES DE PROXIMITÉ (accelere Like)
CREATE INDEX idx_profiles_location ON profiles USING GIST (location_coords);

--- INDEX SPATIAL POUR LA RECHERCHE DE PSEUDOS 
CREATE INDEX IF NOT EXISTS idx_profile_username_trgm ON profiles USING GIN (username gin_trgm_ops);


CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    
    -- Contenu
    content TEXT, -- Le texte du post (peut être nul si c'est juste une image)
    type post_type DEFAULT 'TEXT',
    visibility post_visibility DEFAULT 'PUBLIC',
    
    -- Media principal (URL Cloudinary/S3)
    media_url TEXT,
    thumbnail_url TEXT, -- Pour les vidéos ou aperçus de liens
    
    -- Métadonnées (utile pour l'IA ou les algos de recommandation)
    tags VARCHAR(50)[], -- Tableau de hashtags : ['#node', '#sql']
    
    -- Stats déportées (Optionnel : pour éviter les COUNT trop lourds)
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- Dates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXATION CRUCIALE
CREATE INDEX IF NOT EXISTS idx_posts_profile_id ON posts(profile_id);
-- Index pour le Feed : afficher les posts publics les plus récents
CREATE INDEX IF NOT EXISTS idx_posts_feed ON posts(created_at DESC) WHERE visibility = 'PUBLIC';
-- Index GIN pour la recherche par hashtags
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN (tags);


-- TABLE EXPÉRIENCES
CREATE TABLE IF NOT EXISTS experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Pas de UNIQUE ici pour permettre plusieurs jobs par profil
    profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    
    -- Utilisation des ENUMS (valeurs normalisées)
    type_job job_type DEFAULT 'FULL_TIME',
    type_place place_type DEFAULT 'ONSITE',

    
    -- Localisation
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    
    -- Dates et Statut
    start_date DATE NOT NULL,
    end_date DATE, 
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    location VARCHAR(255),
    salary VARCHAR(255),
    currency VARCHAR(10),
    stack VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
    
    -- Contrainte : la date de fin doit être après la date de début
    CONSTRAINT check_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- INDEX pour les expériences
CREATE INDEX idx_exp_profile_id ON experiences(profile_id); -- Accélère l'affichage du profil
CREATE INDEX idx_exp_company ON experiences(company_name); -- Utile pour la recherche par entreprise


-- TABLE ÉDUCATIONS
CREATE TABLE IF NOT EXISTS educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    
    school_name VARCHAR(255) NOT NULL,  
    degree degree_level DEFAULT 'BACHELOR', -- ex: MASTER, BACHELOR
    field_of_study VARCHAR(255), -- ex: Informatique
    
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    location VARCHAR(255),
    stack VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
    
    CONSTRAINT check_edu_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- INDEX pour les formations
CREATE INDEX idx_edu_profile_id ON educations(profile_id);
CREATE INDEX idx_edu_school ON educations(school_name); -- Utile pour voir les Alumnis d'une école


CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255)
);

--- INDEX POUR UNE RECHERCHE INSTANNÉE DANS LA BARRE DE RECHERCHE 

CREATE INDEX IF NOT EXISTS idx_skills_name_trgm ON skills USING GIN (name gin_trgm_ops);



CREATE TABLE IF NOT EXISTS profile_skills (
    profile_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    
    level skill_level DEFAULT 'INTERMEDIATE', -- ex: BEGINNER, ADVANCED
    
    -- Nombre de fois où d'autres utilisateurs ont validé cette compétence
    endorsements_count INTEGER DEFAULT 0,
    
    PRIMARY KEY (profile_id, skill_id), -- Un utilisateur ne peut pas ajouter 2 fois la même skill
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour charger les skills d'un profil rapidement
CREATE INDEX IF NOT EXISTS idx_profile_skills_pid ON profile_skills(profile_id);



CREATE TABLE IF NOT EXISTS skill_endorsements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL,
    profile_id UUID NOT NULL,
    endorser_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE, -- Celui qui donne son vote
    
    FOREIGN KEY (profile_id, skill_id) REFERENCES profile_skills(profile_id, skill_id) ON DELETE CASCADE,
    UNIQUE (profile_id, skill_id, endorser_id), -- On ne peut recommander qu'une seule fois la même skill
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,  
    slug VARCHAR(100) UNIQUE NOT NULL   
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    category_id UUID REFERENCES project_categories(id) ON DELETE SET NULL,  
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- LE LIEN PRINCIPAL (Docs, Behance, Drive, ou Site Perso)
    presentation_url TEXT NOT NULL, 
    -- Type de lien pour l'affichage des icônes
    link_platform project_link_type DEFAULT 'OTHER',
    
    -- Backup pour les développeurs (optionnel)
    repository_url TEXT, 
    
    -- VISUEL (Essentiel pour les graphistes et le rendu du portfolio)
    thumbnail_url TEXT, -- Image de couverture du projet
    
    -- ÉTAT ET DATES
    is_ongoing BOOLEAN DEFAULT FALSE,
    start_date DATE,
    completion_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXATION
CREATE INDEX idx_projects_profile ON projects(profile_id);
CREATE INDEX idx_projects_category ON projects(category_id);
-- Index pour chercher par plateforme (ex: tous les projets sur Behance)
CREATE INDEX idx_projects_platform ON projects(link_platform);


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


