-- Create companies table with advanced constraints and slug support
DROP TABLE IF EXISTS companies CASCADE;
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- The "Boss" of the company space
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL, -- Clean URL (e.g., /company/my-business)
    is_verified BOOLEAN DEFAULT FALSE, -- Trust badge
    
    logo_url TEXT,
    banner_url TEXT,
    description TEXT,
    website_url TEXT,
    company_size VARCHAR(100),
    company_type VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete support

    -- Constraints
    CONSTRAINT check_company_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT check_slug_format CHECK (slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    CONSTRAINT check_website_url_format CHECK (website_url IS NULL OR website_url ~* '^https?://[^\s/$.?#].[^\s]*$')
);

-- Index for owner lookup
CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id);

-- Index for case-insensitive name search
CREATE INDEX IF NOT EXISTS idx_companies_name_search ON companies (lower(name));

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_update_companies_updated_at ON companies;
CREATE TRIGGER trg_update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
