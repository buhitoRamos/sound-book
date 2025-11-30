-- Disable Row Level Security (RLS) for the `public.users` table
-- and remove any policies defined on it.
--
-- WARNING: Disabling RLS and dropping policies reduces data protection.
-- Use only in development or when you understand the security implications.

BEGIN;

-- Disable RLS for the table (safe if table exists)
ALTER TABLE IF EXISTS public.users
  DISABLE ROW LEVEL SECURITY;

-- Drop all policies on the table (if any). This loops through pg_catalog
-- policy entries for the table and drops each policy by name.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT polname
    FROM pg_catalog.pg_policy
    WHERE polrelid = 'public.users'::regclass
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', r.polname);
  END LOOP;
END;
$$;

COMMIT;

-- Usage:
-- 1) Paste the contents into the Supabase SQL editor and run.
-- 2) Or run via psql connected to your database:
--    psql "postgresql://<user>:<pass>@<host>:<port>/<db>" -f scripts/disable_rls.sql
