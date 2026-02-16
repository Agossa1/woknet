-- Create degree_level ENUM if it doesn't exist
DO $$ BEGIN
    CREATE TYPE degree_level AS ENUM (
        'HIGH_SCHOOL',
        'ASSOCIATE',
        'BACHELOR',
        'MASTER',
        'DOCTORATE',
        'CERTIFICATE',
        'DIPLOMA',
        'PROFESSIONAL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- TABLE ÉDUCATIONS
CREATE TABLE IF NOT EXISTS educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    
    school_name VARCHAR(255) NOT NULL,  
    degree degree_level DEFAULT 'BACHELOR', -- ex: MASTER, BACHELOR
    field_of_study VARCHAR(255), -- ex: Informatique
    
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    location VARCHAR(255),
    stack VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT check_edu_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_educations_profile_id ON educations(profile_id);
CREATE INDEX IF NOT EXISTS idx_educations_deleted_at ON educations(deleted_at);
