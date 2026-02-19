-- Migration logic for Premium Profile Modules (Recruiter Ready)
-- This migration adds 10 specialized tables to enrich professional profiles.

-- 0. Requisite ENUMS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'language_proficiency') THEN
        CREATE TYPE language_proficiency AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'FLUENT', 'NATIVE');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'featured_type') THEN
        CREATE TYPE featured_type AS ENUM ('POST', 'PROJECT', 'EXTERNAL_LINK');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'integration_platform') THEN
        CREATE TYPE integration_platform AS ENUM ('GITHUB', 'LEETCODE', 'DRIBBBLE', 'BEHANCE', 'STACKOVERFLOW');
    END IF;
END$$;

-- 1. LANGUAGES
CREATE TABLE IF NOT EXISTS profile_languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    proficiency language_proficiency DEFAULT 'INTERMEDIATE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_languages_profile ON profile_languages(profile_id);

-- 2. CERTIFICATIONS
CREATE TABLE IF NOT EXISTS profile_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255) NOT NULL,
    issue_date DATE,
    expiration_date DATE,
    credential_id VARCHAR(255),
    credential_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_certs_profile ON profile_certifications(profile_id);

-- 3. FEATURED CONTENT (Mise en avant)
CREATE TABLE IF NOT EXISTS profile_featured_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    type featured_type NOT NULL,
    target_id UUID, -- References post_id or project_id if internal
    title VARCHAR(255),
    description TEXT,
    thumbnail_url TEXT,
    external_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_featured_profile ON profile_featured_content(profile_id);

-- 4. SKILL CATEGORIES
CREATE TABLE IF NOT EXISTS profile_skill_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_skill_cats_profile ON profile_skill_categories(profile_id);

-- 5. SKILL CATEGORY MAPPING
CREATE TABLE IF NOT EXISTS profile_skill_category_mapping (
    category_id UUID REFERENCES profile_skill_categories(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    PRIMARY KEY (category_id, skill_id)
);

-- 6. EXTERNAL INTEGRATIONS (Proof of Work)
CREATE TABLE IF NOT EXISTS profile_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    platform integration_platform NOT NULL,
    username VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (profile_id, platform)
);

-- 7. CAREER PREFERENCES
CREATE TABLE IF NOT EXISTS profile_career_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    desired_roles VARCHAR(255)[] DEFAULT '{}',
    work_types job_type[] DEFAULT '{}',
    locations VARCHAR(255)[] DEFAULT '{}',
    min_salary NUMERIC,
    currency VARCHAR(10) DEFAULT 'EUR',
    is_actively_looking BOOLEAN DEFAULT FALSE,
    availability_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. RESUME SETTINGS (Tailored Export)
CREATE TABLE IF NOT EXISTS profile_resume_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    template_name VARCHAR(50) DEFAULT 'minimalist',
    accent_color VARCHAR(7) DEFAULT '#000000',
    show_salary BOOLEAN DEFAULT FALSE,
    show_contact_info BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. PROFILE VIEWS (Insights)
CREATE TABLE IF NOT EXISTS profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
    viewer_registration_ip VARCHAR(255),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_views_profile_date ON profile_views(profile_id, viewed_at DESC);

-- 10. AWARDS & HONORS
CREATE TABLE IF NOT EXISTS profile_awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    date_awarded DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_awards_profile ON profile_awards(profile_id);

-- BONUS: Add Open to Work badge flag directly to profiles for fast lookup
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_open_to_work BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50) DEFAULT 'OPEN';
