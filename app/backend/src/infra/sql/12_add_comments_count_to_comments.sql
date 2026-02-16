-- Add comments_count to comments table to track replies
ALTER TABLE comments ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
