-- Migration: Ajout des types de réactions multiples
-- Cette migration est SAFE et BACKWARD-COMPATIBLE

-- 1. Créer l'ENUM pour les types de réactions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reaction_type') THEN
        CREATE TYPE reaction_type AS ENUM (
            'LIKE',           -- 👍 J'aime (par défaut)
            'CELEBRATE',      -- 🎉 Bravo
            'SUPPORT',        -- 💪 Soutien
            'LOVE',           -- ❤️ J'adore
            'INSIGHTFUL',     -- 💡 Instructif
            'FUNNY'           -- 😂 Amusant
        );
    END IF;
END$$;

-- 2. Ajouter la colonne reaction_type avec DEFAULT 'LIKE' pour rétrocompatibilité
-- Tous les likes existants deviendront automatiquement des "LIKE"
ALTER TABLE likes 
ADD COLUMN IF NOT EXISTS reaction_type reaction_type DEFAULT 'LIKE' NOT NULL;

-- 3. Créer un index pour améliorer les performances des filtres par type
CREATE INDEX IF NOT EXISTS idx_likes_reaction_type ON likes(reaction_type);

-- 4. Créer un index composite pour optimiser les requêtes groupées
CREATE INDEX IF NOT EXISTS idx_likes_post_reaction ON likes(post_id, reaction_type);

-- 5. Faire la même chose pour les comment_likes
ALTER TABLE comment_likes 
ADD COLUMN IF NOT EXISTS reaction_type reaction_type DEFAULT 'LIKE' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_comment_likes_reaction_type ON comment_likes(reaction_type);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_reaction ON comment_likes(comment_id, reaction_type);

-- IMPORTANT: Cette migration est SAFE car :
-- - Les likes existants restent intacts (DEFAULT 'LIKE')
-- - Aucune contrainte UNIQUE cassée (on peut toujours avoir 1 seul like par user/post)
-- - Le code actuel continue de fonctionner sans modification
