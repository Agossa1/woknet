-- Migration: Ajout du support multi-médias pour les posts
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}';

-- Index GIN pour accélérer les recherches si besoin (rare pour des URLs mais utile pour la cohérence)
CREATE INDEX IF NOT EXISTS idx_posts_media_urls ON posts USING GIN (media_urls);
