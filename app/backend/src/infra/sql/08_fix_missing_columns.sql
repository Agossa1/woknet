-- Add deleted_at to experiences if it doesn't exist
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add deleted_at to educations if it doesn't exist
ALTER TABLE educations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add social columns to profiles if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_github VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_twitter VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_linkedin VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_instagram VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_facebook VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_tiktok VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_youtube VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_whatsapp VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_telegram VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_snapchat VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_discord VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_twitch VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_reddit VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_other VARCHAR(255);
