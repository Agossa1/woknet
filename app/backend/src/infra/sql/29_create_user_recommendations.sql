-- ==========================================
-- USER RECOMMENDATIONS (TESTIMONIALS)
-- ==========================================

CREATE TYPE recommendation_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN');

CREATE TABLE IF NOT EXISTS user_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    giver_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    relationship VARCHAR(100), -- e.g., "Managed directly", "Colleague", etc.
    status recommendation_status DEFAULT 'PENDING',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT cannot_recommend_self CHECK (giver_id <> receiver_id)
);

-- Indexes for performance
CREATE INDEX idx_recommendations_receiver ON user_recommendations(receiver_id) WHERE status = 'APPROVED';
CREATE INDEX idx_recommendations_giver ON user_recommendations(giver_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_recommendations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_user_recommendations_updated_at
    BEFORE UPDATE ON user_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_recommendations_timestamp();
