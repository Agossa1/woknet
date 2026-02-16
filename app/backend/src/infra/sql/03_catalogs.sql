-- Creation of countries table
CREATE TABLE IF NOT EXISTS countries (
    code CHAR(2) PRIMARY KEY,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    phone_code VARCHAR(10),
    flag_emoji VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed countries
INSERT INTO countries (code, name_fr, name_en, flag_emoji, phone_code) VALUES
('BJ', 'Bénin', 'Benin', '🇧🇯', '229'),
('TG', 'Togo', 'Togo', '🇹🇬', '228'),
('CI', 'Côte d''Ivoire', 'Ivory Coast', '🇨🇮', '225'),
('SN', 'Sénégal', 'Senegal', '🇸🇳', '221'),
('BF', 'Burkina Faso', 'Burkina Faso', '🇧🇫', '226'),
('ML', 'Mali', 'Mali', '🇲🇱', '223'),
('NE', 'Niger', 'Niger', '🇳🇪', '227'),
('FR', 'France', 'France', '🇫🇷', '33'),
('BE', 'Belgique', 'Belgium', '🇧🇪', '32'),
('CA', 'Canada', 'Canada', '🇨🇦', '1'),
('US', 'États-Unis', 'United States', '🇺🇸', '1'),
('CM', 'Cameroun', 'Cameroon', '🇨🇲', '237'),
('GA', 'Gabon', 'Gabon', '🇬🇦', '241'),
('CD', 'RDC', 'DR Congo', '🇨🇩', '243'),
('CG', 'Congo', 'Congo', '🇨🇬', '242'),
('MA', 'Maroc', 'Morocco', '🇲🇦', '212'),
('DZ', 'Algérie', 'Algeria', '🇩🇿', '213'),
('TN', 'Tunisie', 'Tunisia', '🇹🇳', '216'),
('LU', 'Luxembourg', 'Luxembourg', '🇱🇺', '352'),
('CH', 'Suisse', 'Switzerland', '🇨🇭', '41'),
('GN', 'Guinée', 'Guinea', '🇬🇳', '224'),
('MG', 'Madagascar', 'Madagascar', '🇲🇬', '261')
ON CONFLICT (code) DO UPDATE SET name_fr = EXCLUDED.name_fr;

-- Creation of job_titles table
CREATE TABLE IF NOT EXISTS job_catalog (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100)
);

INSERT INTO job_catalog (title, category) VALUES
('Développeur Fullstack', 'TECH'),
('Développeur Frontend', 'TECH'),
('Développeur Backend', 'TECH'),
('Mobile App Developer', 'TECH'),
('DevOps Engineer', 'TECH'),
('Data Scientist', 'TECH'),
('UI/UX Designer', 'DESIGN'),
('Product Manager', 'MANAGEMENT'),
('Chef de Projet Digital', 'MANAGEMENT'),
('Social Media Manager', 'MARKETING'),
('Content Creator', 'MARKETING'),
('Commercial / Sales', 'BUSINESS'),
('Business Developer', 'BUSINESS'),
('Comptable', 'FINANCE'),
('Responsable RH', 'HR'),
('Analyste Financier', 'FINANCE'),
('Consultant', 'CONSULTING'),
('Architecte', 'CONSTRUCTION'),
('Infirmier/ère', 'HEALTH'),
('Médecin', 'HEALTH'),
('Avocat', 'LEGAL'),
('Assistant(e) Administratif(ve)', 'ADMIN')
ON CONFLICT (title) DO NOTHING;

-- Job Types Table
CREATE TABLE IF NOT EXISTS job_types (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL
);

INSERT INTO job_types (id, label) VALUES
('FULL_TIME', 'CDI / Temps plein'),
('PART_TIME', 'Temps partiel'),
('FREELANCE', 'Freelance / Indépendant'),
('INTERNSHIP', 'Stage'),
('APPRENTICESHIP', 'Apprentissage / Alternance'),
('REMOTE', 'Télétravail complet'),
('TEMPORARY', 'Contrat temporaire / Intérim')
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label;
