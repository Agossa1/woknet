-- Ajoute un compteur de vues sur les posts (pour vidéos/images notamment)

ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

