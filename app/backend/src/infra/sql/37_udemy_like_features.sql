-- Ajout de détails pour une expérience type Udemy
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS learning_objectives TEXT[], -- "Ce que vous allez apprendre"
ADD COLUMN IF NOT EXISTS requirements TEXT[],          -- "Exigences"
ADD COLUMN IF NOT EXISTS target_audience TEXT[],      -- "À qui s'adresse ce cours"
ADD COLUMN IF NOT EXISTS long_description TEXT;      -- Description détaillée
