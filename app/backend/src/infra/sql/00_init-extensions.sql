-- init-extensions.sql
-- This script runs at container init (mounted into /docker-entrypoint-initdb.d)
-- It creates the safe/available extensions used by the schema.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- pgvector - included in pgvector/pgvector image
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'vector') THEN
    RAISE NOTICE 'pgvector (vector) not available in this image';
  ELSE
    CREATE EXTENSION IF NOT EXISTS vector;
  END IF;
END$$;

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- PostGIS (optional - only if available)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'postgis') THEN
    CREATE EXTENSION IF NOT EXISTS postgis;
    CREATE EXTENSION IF NOT EXISTS postgis_topology;
  ELSE
    RAISE NOTICE 'PostGIS not available in this image';
  END IF;
END$$;

-- TimescaleDB (optional - only if available)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'timescaledb') THEN
    CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
  ELSE
    RAISE NOTICE 'TimescaleDB not available in this image';
  END IF;
END$$;
