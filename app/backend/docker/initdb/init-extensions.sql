-- init-extensions.sql
-- This script runs at container init (mounted into /docker-entrypoint-initdb.d)
-- It creates the safe/available extensions used by the schema.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- pgvector was installed in the custom image; extension name can be 'vector' or 'pgvector'
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'vector') THEN
    RAISE NOTICE 'pgvector (vector) not available in this image';
  ELSE
    CREATE EXTENSION IF NOT EXISTS vector;
  END IF;
END$$;

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- TimescaleDB (hypertables, compression) - available because image is based on timescaledb
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Note: pgroonga, timescaledb, citus, age may require additional OS packages or
-- different base images. If you need them, install via the package manager in the
-- Dockerfile or use official images for those extensions.
