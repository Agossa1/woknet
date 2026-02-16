-- Migration: 0001_migrate_schema.sql
-- Objectif: renommer colonnes incohérentes et convertir anciennes valeurs ENUM/text
-- Exécuter en transaction sur un environnement de staging/test d'abord.

BEGIN;

-- 1) Renommer d'anciennes colonnes si elles existent
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='update_at') THEN
    EXECUTE 'ALTER TABLE users RENAME COLUMN update_at TO updated_at';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='delete_at') THEN
    EXECUTE 'ALTER TABLE users RENAME COLUMN delete_at TO deleted_at';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='update_at') THEN
    EXECUTE 'ALTER TABLE profiles RENAME COLUMN update_at TO updated_at';
  END IF;
END$$;

-- Helper pattern: create a new enum type <name>_new, cast column to text, normalize values, cast to new enum, replace type name

-- POSTS: visibility (public -> PUBLIC), type (text->TEXT)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_visibility_new') THEN
    CREATE TYPE post_visibility_new AS ENUM ('PUBLIC','CONNECTIONS','PRIVATE');
  END IF;
END$$;

ALTER TABLE posts ALTER COLUMN visibility TYPE text USING visibility::text;
UPDATE posts SET visibility = UPPER(visibility::text) WHERE visibility IS NOT NULL;
ALTER TABLE posts ALTER COLUMN visibility TYPE post_visibility_new USING visibility::post_visibility_new;
DROP TYPE IF EXISTS post_visibility;
ALTER TYPE post_visibility_new RENAME TO post_visibility;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_type_new') THEN
    CREATE TYPE post_type_new AS ENUM ('TEXT','IMAGE','VIDEO','DOCUMENT','LINK');
  END IF;
END$$;
ALTER TABLE posts ALTER COLUMN type TYPE text USING type::text;
UPDATE posts SET type = UPPER(type::text) WHERE type IS NOT NULL;
ALTER TABLE posts ALTER COLUMN type TYPE post_type_new USING type::post_type_new;
DROP TYPE IF EXISTS post_type;
ALTER TYPE post_type_new RENAME TO post_type;

-- JOBS: status (draft -> DRAFT), creator_id nullable
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status_new') THEN
    CREATE TYPE job_status_new AS ENUM ('DRAFT','PUBLISHED','CLOSED','ARCHIVED');
  END IF;
END$$;
ALTER TABLE jobs ALTER COLUMN status TYPE text USING status::text;
UPDATE jobs SET status = UPPER(status::text) WHERE status IS NOT NULL;
ALTER TABLE jobs ALTER COLUMN status TYPE job_status_new USING status::job_status_new;
DROP TYPE IF EXISTS job_status;
ALTER TYPE job_status_new RENAME TO job_status;

-- EXPERIENCES: type_job and type_place
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_type_new') THEN
    CREATE TYPE job_type_new AS ENUM (
      'FULL_TIME','PART_TIME','PERMANENT','FIXED_TERM','TEMPORARY','FREELANCE','SELF_EMPLOYED','INTERNSHIP','APPRENTICESHIP','REMOTE','VOLUNTEER'
    );
  END IF;
END$$;
ALTER TABLE experiences ALTER COLUMN type_job TYPE text USING type_job::text;
-- Map some common french/legacy terms to normalized ones
UPDATE experiences SET type_job = CASE
  WHEN LOWER(type_job) IN ('cdi','full-time','full_time') THEN 'FULL_TIME'
  WHEN LOWER(type_job) IN ('cdd','fixed-term','fixed_term') THEN 'FIXED_TERM'
  WHEN LOWER(type_job) LIKE '%part%' THEN 'PART_TIME'
  ELSE UPPER(type_job)
END WHERE type_job IS NOT NULL;
ALTER TABLE experiences ALTER COLUMN type_job TYPE job_type_new USING type_job::job_type_new;
DROP TYPE IF EXISTS job_type;
ALTER TYPE job_type_new RENAME TO job_type;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'place_type_new') THEN
    CREATE TYPE place_type_new AS ENUM ('ONSITE','HYBRID','REMOTE','MOBILE','TRAVEL_BASED','OFFSHORE','COWORKING','FLEXIBLE');
  END IF;
END$$;
ALTER TABLE experiences ALTER COLUMN type_place TYPE text USING type_place::text;
UPDATE experiences SET type_place = CASE
  WHEN LOWER(type_place) IN ('onsite','on-site','on_site') THEN 'ONSITE'
  WHEN LOWER(type_place) IN ('hybrid') THEN 'HYBRID'
  WHEN LOWER(type_place) IN ('remote') THEN 'REMOTE'
  ELSE UPPER(type_place)
END WHERE type_place IS NOT NULL;
ALTER TABLE experiences ALTER COLUMN type_place TYPE place_type_new USING type_place::place_type_new;
DROP TYPE IF EXISTS place_type;
ALTER TYPE place_type_new RENAME TO place_type;

-- EDUCATIONS: degree
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'degree_level_new') THEN
    CREATE TYPE degree_level_new AS ENUM ('HIGH_SCHOOL','BACHELOR','MASTER','DOCTORATE','CERTIFICATION','SELF_TAUGHT','OTHER');
  END IF;
END$$;
ALTER TABLE educations ALTER COLUMN degree TYPE text USING degree::text;
UPDATE educations SET degree = CASE
  WHEN LOWER(degree) IN ('bac','high school diploma') THEN 'HIGH_SCHOOL'
  WHEN LOWER(degree) LIKE '%bachelor%' THEN 'BACHELOR'
  WHEN LOWER(degree) LIKE '%master%' THEN 'MASTER'
  WHEN LOWER(degree) LIKE '%phd%' OR LOWER(degree) LIKE '%doctor%' THEN 'DOCTORATE'
  ELSE UPPER(degree)
END WHERE degree IS NOT NULL;
ALTER TABLE educations ALTER COLUMN degree TYPE degree_level_new USING degree::degree_level_new;
DROP TYPE IF EXISTS degree_level;
ALTER TYPE degree_level_new RENAME TO degree_level;

-- PROFILE_SKILLS: level -> skill_level
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_level_new') THEN
    CREATE TYPE skill_level_new AS ENUM ('BEGINNER','INTERMEDIATE','ADVANCED','EXPERT');
  END IF;
END$$;
ALTER TABLE profile_skills ALTER COLUMN level TYPE text USING level::text;
UPDATE profile_skills SET level = CASE
  WHEN LOWER(level) IN ('beginner','junior') THEN 'BEGINNER'
  WHEN LOWER(level) IN ('intermediate','mid') THEN 'INTERMEDIATE'
  WHEN LOWER(level) IN ('advanced','senior') THEN 'ADVANCED'
  WHEN LOWER(level) IN ('expert') THEN 'EXPERT'
  ELSE UPPER(level)
END WHERE level IS NOT NULL;
ALTER TABLE profile_skills ALTER COLUMN level TYPE skill_level_new USING level::skill_level_new;
DROP TYPE IF EXISTS skill_level;
ALTER TYPE skill_level_new RENAME TO skill_level;

-- PROJECTS: link_platform
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_link_type_new') THEN
    CREATE TYPE project_link_type_new AS ENUM ('GITHUB','BEHANCE','DRIBBBLE','GOOGLE_DOCS','GOOGLE_DRIVE','CANVA','EXTERNAL_WEBSITE','OTHER');
  END IF;
END$$;
ALTER TABLE projects ALTER COLUMN link_platform TYPE text USING link_platform::text;
UPDATE projects SET link_platform = UPPER(link_platform::text) WHERE link_platform IS NOT NULL;
ALTER TABLE projects ALTER COLUMN link_platform TYPE project_link_type_new USING link_platform::project_link_type_new;
DROP TYPE IF EXISTS project_link_type;
ALTER TYPE project_link_type_new RENAME TO project_link_type;

-- COMPANY_MEMBERS: role
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_role_new') THEN
    CREATE TYPE company_role_new AS ENUM ('ADMIN','RECRUITER','EDITOR');
  END IF;
END$$;
ALTER TABLE company_members ALTER COLUMN role TYPE text USING role::text;
UPDATE company_members SET role = UPPER(role::text) WHERE role IS NOT NULL;
ALTER TABLE company_members ALTER COLUMN role TYPE company_role_new USING role::company_role_new;
DROP TYPE IF EXISTS company_role;
ALTER TYPE company_role_new RENAME TO company_role;

COMMIT;

-- Notes:
-- 1) Exécute ce script en staging. Vérifie qu'aucune contrainte métier ne sera violée.
-- 2) Si tu as des triggers ou views dépendants des anciens types/colonnes, adapte-les avant d'exécuter.
-- 3) Backup complet recommandé avant exécution.
