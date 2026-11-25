-- =========================================================================
-- BASEERA DIRECTORY: SUPER ADMIN RBAC & AUDIT LOG MIGRATION (PHASE 1)
-- =========================================================================

-- 1. Create User Role Enum
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'MODERATOR', 'PROVIDER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Users Table with RBAC Role
CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  role text DEFAULT 'PROVIDER' CHECK (role IN ('SUPER_ADMIN', 'MODERATOR', 'PROVIDER')),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure role column exists if table existed previously
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'PROVIDER' CHECK (role IN ('SUPER_ADMIN', 'MODERATOR', 'PROVIDER'));

-- 3. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id text NOT NULL,
  admin_email text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs (admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
