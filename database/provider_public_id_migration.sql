-- =========================================================================
-- BASEERA DIRECTORY: SEQUENTIAL PUBLIC ID MIGRATION
-- Starts strictly at 1001, autoincrements safely for all providers
-- =========================================================================

-- 1. Create dedicated sequence starting at 1001
CREATE SEQUENCE IF NOT EXISTS "Provider_publicId_seq" START WITH 1001;
ALTER SEQUENCE "Provider_publicId_seq" RESTART WITH 1001;

-- 2. Add publicId column with unique constraint and default from sequence
ALTER TABLE IF EXISTS public.providers 
  ADD COLUMN IF NOT EXISTS "publicId" integer UNIQUE DEFAULT nextval('"Provider_publicId_seq"');

-- 3. Also add snake_case alias column public_id for Supabase REST compatibility
ALTER TABLE IF EXISTS public.providers 
  ADD COLUMN IF NOT EXISTS public_id integer UNIQUE DEFAULT nextval('"Provider_publicId_seq"');

-- 4. Backfill any existing providers that have null publicId
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.providers WHERE "publicId" IS NULL LOOP
    UPDATE public.providers 
    SET "publicId" = nextval('"Provider_publicId_seq"'),
        public_id = currval('"Provider_publicId_seq"')
    WHERE id = r.id;
  END LOOP;
END $$;

-- 5. Ensure sequence starts at least at 1001 and above max existing publicId
SELECT setval(
  '"Provider_publicId_seq"', 
  COALESCE(GREATEST((SELECT MAX("publicId") FROM public.providers), 1000), 1000) + 1, 
  false
);

-- 6. Create performance indexes for instant lookups by publicId
CREATE INDEX IF NOT EXISTS idx_providers_public_id_camel ON public.providers ("publicId");
CREATE INDEX IF NOT EXISTS idx_providers_public_id_snake ON public.providers (public_id);
