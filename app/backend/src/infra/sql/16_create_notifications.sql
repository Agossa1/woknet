-- 1. On s'assure que la fonction utilitaire existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Création de l'Enum (ton bloc DO est correct)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM (
            'POST_LIKE',
            'COMMENT_LIKE',
            'POST_COMMENT',
            'POST_SHARE',
            'NEW_FOLLOW',
            'CONNECTION_REQUEST',
            'SYSTEM'
        );
    END IF;
END $$;

-- 3. Création de la table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
    type notification_type NOT NULL,
    item_id UUID, -- post_id, comment_id, etc.
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Index pour la performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 5. Trigger pour updated_at
-- On supprime le trigger s'il existe déjà pour éviter l'erreur au cas où la migration est relancée
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();