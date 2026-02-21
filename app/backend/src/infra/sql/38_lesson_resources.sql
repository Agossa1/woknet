-- Ajout de la gestion des pièces jointes et ressources pour les leçons
ALTER TABLE course_lessons
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Optionnel : on pourrait aussi vouloir stocker un ID de vidéo spécifique pour Cloudinary
ALTER TABLE course_lessons
ADD COLUMN IF NOT EXISTS video_id VARCHAR(255);
