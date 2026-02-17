-- Migration pour ajouter la fonctionnalité d'enregistrement de posts (Bookmarks)
CREATE TABLE IF NOT EXISTS saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, post_id)
);

-- Index pour accélérer la récupération des posts enregistrés par un utilisateur
CREATE INDEX IF NOT EXISTS idx_saved_posts_profile_id ON saved_posts(profile_id);
