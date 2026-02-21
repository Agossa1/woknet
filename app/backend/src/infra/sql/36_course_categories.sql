-- 1. Création de la table des catégories de cours
CREATE TABLE course_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50), -- Optionnel : nom d'icône Lucide par exemple
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insertion des catégories initiales
INSERT INTO course_categories (name, slug, icon) VALUES
('Développement', 'developpement', 'Code'),
('Design', 'design', 'Palette'),
('Marketing', 'marketing', 'Megaphone'),
('Business', 'business', 'Briefcase'),
('Data & IA', 'data-ia', 'Brain'),
('Finance', 'finance', 'Wallet')
ON CONFLICT (name) DO NOTHING;

-- 3. Ajout de la colonne category_id dans la table courses
ALTER TABLE courses ADD COLUMN category_id UUID REFERENCES course_categories(id);

-- 4. Migration des données existantes (mapping basé sur le nom)
UPDATE courses c
SET category_id = cc.id
FROM course_categories cc
WHERE c.category = cc.name;

-- 5. On pourra supprimer l'ancienne colonne plus tard si tout est OK
-- ALTER TABLE courses DROP COLUMN category;
