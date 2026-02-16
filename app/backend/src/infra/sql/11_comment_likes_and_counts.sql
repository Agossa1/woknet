-- Add likes_count to comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
    profile_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (profile_id, comment_id)
);

-- Index for comment_likes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
