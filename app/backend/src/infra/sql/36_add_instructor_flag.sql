-- Ajout du flag pour identifier les formateurs
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_instructor BOOLEAN DEFAULT FALSE;