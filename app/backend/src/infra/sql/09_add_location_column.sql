-- Add location column to experiences if it doesn't exist
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Add location column to educations if it doesn't exist (safety check)
ALTER TABLE educations ADD COLUMN IF NOT EXISTS location VARCHAR(255);
