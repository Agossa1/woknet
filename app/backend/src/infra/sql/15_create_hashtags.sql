-- HASHTAGS MODULE
-- Automatic hashtag extraction and trending topics

-- 1. Hashtags table
CREATE TABLE IF NOT EXISTS hashtags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 1,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Post-Hashtag relationship (many-to-many)
CREATE TABLE IF NOT EXISTS post_hashtags (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, hashtag_id)
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hashtags_usage ON hashtags(usage_count DESC, last_used_at DESC);
CREATE INDEX IF NOT EXISTS idx_hashtags_name_trgm ON hashtags USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag ON post_hashtags(hashtag_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post ON post_hashtags(post_id);

-- 4. Trending hashtags view
CREATE OR REPLACE VIEW trending_hashtags AS
SELECT 
    h.id,
    h.name,
    h.usage_count,
    COUNT(DISTINCT ph.post_id) FILTER (WHERE ph.created_at > NOW() - INTERVAL '7 days') as posts_last_week,
    COUNT(DISTINCT ph.post_id) FILTER (WHERE ph.created_at > NOW() - INTERVAL '24 hours') as posts_last_day
FROM hashtags h
LEFT JOIN post_hashtags ph ON h.id = ph.hashtag_id
GROUP BY h.id, h.name, h.usage_count
ORDER BY posts_last_week DESC, usage_count DESC
LIMIT 50;

COMMENT ON TABLE hashtags IS 'Stores unique hashtags used across the platform';
COMMENT ON TABLE post_hashtags IS 'Links posts to their hashtags';
COMMENT ON VIEW trending_hashtags IS 'Real-time trending hashtags based on recent usage';
