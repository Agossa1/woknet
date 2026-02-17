-- 26_job_suggestions.sql
-- Tables pour les suggestions d'intitulés de postes et de lieux de travail

-- Table des intitulés de postes suggérés
CREATE TABLE IF NOT EXISTS job_titles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100), -- Tech, Finance, Marketing, etc.
    popularity INT DEFAULT 0, -- Nombre d'utilisations
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des lieux de travail
CREATE TABLE IF NOT EXISTS work_locations (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    country_code VARCHAR(2), -- BJ, FR, US, etc.
    full_location VARCHAR(255) NOT NULL, -- "Porto-Novo, Ouémé, Bénin"
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    popularity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(city, region, country)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_job_titles_category ON job_titles(category);
CREATE INDEX IF NOT EXISTS idx_job_titles_popularity ON job_titles(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_work_locations_country ON work_locations(country);
CREATE INDEX IF NOT EXISTS idx_work_locations_popularity ON work_locations(popularity DESC);

-- Insertion des intitulés de postes populaires
INSERT INTO job_titles (title, category, popularity) VALUES
-- Tech/IT
('Développeur Full Stack', 'Tech', 100),
('Développeur Front-End', 'Tech', 90),
('Développeur Back-End', 'Tech', 85),
('Développeur Mobile', 'Tech', 80),
('DevOps Engineer', 'Tech', 75),
('Data Scientist', 'Tech', 70),
('Ingénieur Logiciel', 'Tech', 95),
('Architecte Logiciel', 'Tech', 65),
('Chef de Projet IT', 'Tech', 60),
('Product Manager', 'Tech', 75),
('UI/UX Designer', 'Design', 70),
('Designer Graphique', 'Design', 65),
('Analyste de Données', 'Tech', 60),
('Administrateur Système', 'Tech', 55),
('Ingénieur Réseau', 'Tech', 50),
('Cybersécurité Analyst', 'Tech', 65),
('Ingénieur IA', 'Tech', 70),
('Cloud Architect', 'Tech', 65),

-- Marketing/Communication
('Responsable Marketing Digital', 'Marketing', 70),
('Community Manager', 'Marketing', 65),
('Chargé de Communication', 'Marketing', 60),
('Responsable SEO/SEA', 'Marketing', 55),
('Content Manager', 'Marketing', 50),
('Copywriter', 'Marketing', 45),
('Chef de Marque', 'Marketing', 60),
('RP Specialist', 'Marketing', 50),

-- Finance/Comptabilité
('Comptable', 'Finance', 75),
('Analyste Financier', 'Finance', 65),
('Contrôleur de Gestion', 'Finance', 60),
('Auditeur', 'Finance', 55),
('Directeur Financier', 'Finance', 70),
('Trésorier', 'Finance', 50),
('Expert-Comptable', 'Finance', 75),

-- Ressources Humaines
('Responsable RH', 'RH', 65),
('Chargé de Recrutement', 'RH', 60),
('Gestionnaire de Paie', 'RH', 55),
('Responsable Formation', 'RH', 50),
('Directeur des Ressources Humaines', 'RH', 65),
('Talent Acquisition Manager', 'RH', 60),

-- Commercial/Vente
('Commercial', 'Vente', 80),
('Business Developer', 'Vente', 70),
('Account Manager', 'Vente', 65),
('Responsable Commercial', 'Vente', 75),
('Directeur des Ventes', 'Vente', 60),
('Vendeur en magasin', 'Vente', 55),
('Ingénieur Commercial', 'Vente', 65),

-- Santé/Médical
('Médecin Généraliste', 'Santé', 80),
('Infirmier', 'Santé', 85),
('Pharmacien', 'Santé', 75),
('Kinéthérapeute', 'Santé', 65),
('Dentiste', 'Santé', 70),
('Psychologue', 'Santé', 60),
('Aide-Soignant', 'Santé', 70),
('Sage-Femme', 'Santé', 65),

-- Éducation/Enseignement
('Professeur d''École', 'Éducation', 80),
('Professeur de Mathématiques', 'Éducation', 75),
('Formateur Professionnel', 'Éducation', 65),
('Enseignant-Chercheur', 'Éducation', 60),
('Éducateur Spécialisé', 'Éducation', 55),

-- BTP/Construction
('Ingénieur Civil', 'BTP', 75),
('Architecte', 'BTP', 70),
('Chef de Chantier', 'BTP', 65),
('Conducteur de Travaux', 'BTP', 60),
('Électricien', 'BTP', 70),
('Plombier', 'BTP', 65),
('Maçon', 'BTP', 60),

-- Hôtellerie/Restauration
('Chef de Cuisine', 'Hôtellerie', 70),
('Serveur', 'Hôtellerie', 80),
('Réceptionniste', 'Hôtellerie', 65),
('Directeur d''Hôtel', 'Hôtellerie', 55),
('Sommelier', 'Hôtellerie', 45),
('Pâtissier', 'Hôtellerie', 60),

-- Agriculture/Agroalimentaire
('Ingénieur Agronome', 'Agriculture', 65),
('Exploitant Agricole', 'Agriculture', 60),
('Technicien Agricole', 'Agriculture', 55),
('Responsable Qualité Agro', 'Agriculture', 50),

-- Industrie/Ingénierie
('Ingénieur Mécanique', 'Industrie', 70),
('Ingénieur Électrique', 'Industrie', 65),
('Responsable Maintenance', 'Industrie', 60),
('Opérateur de Production', 'Industrie', 75),

-- Juridique
('Juriste', 'Juridique', 55),
('Avocat', 'Juridique', 60),
('Responsable Juridique', 'Juridique', 50),
('Notaire', 'Juridique', 55),

-- Transport/Logistique
('Chauffeur Poids Lourd', 'Logistique', 70),
('Responsable Logistique', 'Logistique', 65),
('Gestionnaire de Stock', 'Logistique', 60),
('Chef de Quai', 'Logistique', 55),

-- Autres
('Assistant de Direction', 'Administration', 55),
('Secrétaire', 'Administration', 50),
('Chef de Projet', 'Gestion', 70),
('Consultant', 'Conseil', 65),
('Stagiaire', 'Autre', 40),
('Alternant', 'Autre', 35),
('Agent de Sécurité', 'Services', 60),
('Photographe', 'Art', 50),
('Journaliste', 'Media', 55)
ON CONFLICT (title) DO NOTHING;

-- Insertion des lieux de travail populaires (Bénin et autres pays)
INSERT INTO work_locations (city, region, country, country_code, full_location, popularity) VALUES
-- Bénin
('Cotonou', 'Littoral', 'Bénin', 'BJ', 'Cotonou, Littoral, Bénin', 100),
('Porto-Novo', 'Ouémé', 'Bénin', 'BJ', 'Porto-Novo, Ouémé, Bénin', 80),
('Parakou', 'Borgou', 'Bénin', 'BJ', 'Parakou, Borgou, Bénin', 60),
('Abomey-Calavi', 'Atlantique', 'Bénin', 'BJ', 'Abomey-Calavi, Atlantique, Bénin', 70),
('Djougou', 'Donga', 'Bénin', 'BJ', 'Djougou, Donga, Bénin', 40),

-- France
('Paris', 'Île-de-France', 'France', 'FR', 'Paris, Île-de-France, France', 100),
('Lyon', 'Auvergne-Rhône-Alpes', 'France', 'FR', 'Lyon, Auvergne-Rhône-Alpes, France', 85),
('Marseille', 'Provence-Alpes-Côte d''Azur', 'France', 'FR', 'Marseille, Provence-Alpes-Côte d''Azur, France', 80),
('Toulouse', 'Occitanie', 'France', 'FR', 'Toulouse, Occitanie, France', 75),
('Bordeaux', 'Nouvelle-Aquitaine', 'France', 'FR', 'Bordeaux, Nouvelle-Aquitaine, France', 70),
('Nantes', 'Pays de la Loire', 'France', 'FR', 'Nantes, Pays de la Loire, France', 70),
('Lille', 'Hauts-de-France', 'France', 'FR', 'Lille, Hauts-de-France, France', 65),

-- Afrique de l'Ouest
('Lomé', 'Maritime', 'Togo', 'TG', 'Lomé, Maritime, Togo', 75),
('Accra', 'Greater Accra', 'Ghana', 'GH', 'Accra, Greater Accra, Ghana', 80),
('Lagos', 'Lagos State', 'Nigeria', 'NG', 'Lagos, Lagos State, Nigeria', 95),
('Abidjan', 'Lagunes', 'Côte d''Ivoire', 'CI', 'Abidjan, Lagunes, Côte d''Ivoire', 90),
('Dakar', 'Dakar', 'Sénégal', 'SN', 'Dakar, Dakar, Sénégal', 85),

-- Autres grandes villes
('Londres', 'Angleterre', 'Royaume-Uni', 'GB', 'Londres, Angleterre, Royaume-Uni', 90),
('New York', 'New York', 'États-Unis', 'US', 'New York, New York, États-Unis', 95),
('Montréal', 'Québec', 'Canada', 'CA', 'Montréal, Québec, Canada', 75),
('Bruxelles', 'Bruxelles-Capitale', 'Belgique', 'BE', 'Bruxelles, Bruxelles-Capitale, Belgique', 70),
('Genève', 'Genève', 'Suisse', 'CH', 'Genève, Genève, Suisse', 70)
ON CONFLICT (city, region, country) DO NOTHING;
