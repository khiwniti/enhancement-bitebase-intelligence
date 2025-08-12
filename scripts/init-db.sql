-- BiteBase Intelligence - Minimal DB Initialization Script
-- This file is mounted by docker-compose to initialize the Postgres database.
-- Safe to run multiple times.

-- Enable useful extensions if available (ignore errors if not present)
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'uuid-ossp extension not available, skipping';
END $$;

DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pgcrypto extension not available, skipping';
END $$;

-- Create an application schema (optional)
CREATE SCHEMA IF NOT EXISTS bitebase;

-- Example table (commented out). Un-comment if you need a quick smoke test
-- CREATE TABLE IF NOT EXISTS bitebase.health (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--   status TEXT NOT NULL DEFAULT 'ok'
--);

