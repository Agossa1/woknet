-- 25_jobs.sql

-- Drop existing table if it exists
DROP TABLE IF EXISTS jobs CASCADE;

-- Create jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    requirements TEXT,
    location VARCHAR(255),
    work_type VARCHAR(50) DEFAULT 'full-time',
    salary_min INT,
    salary_max INT,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(50) DEFAULT 'draft',
    is_remote BOOLEAN DEFAULT FALSE,
    application_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_slug ON jobs(slug);
CREATE INDEX idx_jobs_status ON jobs(status);
