-- =========================================================================
-- BASEERA (بصیرہ) - TOP 10 AFRICAN COUNTRIES (39 CITIES) SEED SCRIPT
-- Countries:
--   1. Nigeria (Code: 'ng') - 5 Cities
--   2. South Africa (Code: 'za') - 5 Cities
--   3. Egypt (Code: 'eg') - 4 Cities
--   4. Kenya (Code: 'ke') - 4 Cities
--   5. Ghana (Code: 'gh') - 4 Cities
--   6. Morocco (Code: 'ma') - 4 Cities
--   7. Tanzania (Code: 'tz') - 4 Cities
--   8. Uganda (Code: 'ug') - 3 Cities
--   9. Algeria (Code: 'dz') - 3 Cities
--  10. Ethiopia (Code: 'et') - 3 Cities
--
-- Compatible with both UUID (gen_random_uuid()) and SERIAL primary key schemas.
-- =========================================================================

-- =========================================================================
-- STEP 1: Ensure All 10 African Countries Exist in `public.countries`
-- =========================================================================
DO $$
BEGIN
  -- 1. Nigeria ('ng')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'ng') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Nigeria', 'ng', 'nigeria');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Nigeria', 'ng');
    END IF;
  END IF;

  -- 2. South Africa ('za')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'za') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('South Africa', 'za', 'south-africa');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('South Africa', 'za');
    END IF;
  END IF;

  -- 3. Egypt ('eg')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'eg') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Egypt', 'eg', 'egypt');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Egypt', 'eg');
    END IF;
  END IF;

  -- 4. Kenya ('ke')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'ke') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Kenya', 'ke', 'kenya');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Kenya', 'ke');
    END IF;
  END IF;

  -- 5. Ghana ('gh')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'gh') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Ghana', 'gh', 'ghana');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Ghana', 'gh');
    END IF;
  END IF;

  -- 6. Morocco ('ma')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'ma') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Morocco', 'ma', 'morocco');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Morocco', 'ma');
    END IF;
  END IF;

  -- 7. Tanzania ('tz')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'tz') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Tanzania', 'tz', 'tanzania');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Tanzania', 'tz');
    END IF;
  END IF;

  -- 8. Uganda ('ug')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'ug') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Uganda', 'ug', 'uganda');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Uganda', 'ug');
    END IF;
  END IF;

  -- 9. Algeria ('dz')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'dz') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Algeria', 'dz', 'algeria');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Algeria', 'dz');
    END IF;
  END IF;

  -- 10. Ethiopia ('et')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'et') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Ethiopia', 'et', 'ethiopia');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Ethiopia', 'et');
    END IF;
  END IF;
END $$;

-- =========================================================================
-- STEP 2: Bulk Insert Cities for Nigeria ('ng' - 5 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Lagos', 'lagos'),
    ('Abuja', 'abuja'),
    ('Port Harcourt', 'port-harcourt'),
    ('Kano', 'kano'),
    ('Ibadan', 'ibadan')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'ng' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 3: Bulk Insert Cities for South Africa ('za' - 5 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Johannesburg', 'johannesburg'),
    ('Cape Town', 'cape-town'),
    ('Durban', 'durban'),
    ('Pretoria', 'pretoria'),
    ('Port Elizabeth', 'port-elizabeth')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'za' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 4: Bulk Insert Cities for Egypt ('eg' - 4 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Cairo', 'cairo'),
    ('Alexandria', 'alexandria'),
    ('Giza', 'giza'),
    ('Sharm El Sheikh', 'sharm-el-sheikh')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'eg' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 5: Bulk Insert Cities for Kenya ('ke' - 4 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Nairobi', 'nairobi'),
    ('Mombasa', 'mombasa'),
    ('Kisumu', 'kisumu'),
    ('Nakuru', 'nakuru')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'ke' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 6: Bulk Insert Cities for Ghana ('gh' - 4 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Accra', 'accra'),
    ('Kumasi', 'kumasi'),
    ('Tamale', 'tamale'),
    ('Sekondi-Takoradi', 'sekondi-takoradi')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'gh' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 7: Bulk Insert Cities for Morocco ('ma' - 4 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Casablanca', 'casablanca'),
    ('Rabat', 'rabat'),
    ('Marrakech', 'marrakech'),
    ('Tangier', 'tangier')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'ma' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 8: Bulk Insert Cities for Tanzania ('tz' - 4 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Dar es Salaam', 'dar-es-salaam'),
    ('Dodoma', 'dodoma'),
    ('Arusha', 'arusha'),
    ('Zanzibar City', 'zanzibar-city')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'tz' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 9: Bulk Insert Cities for Uganda ('ug' - 3 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Kampala', 'kampala'),
    ('Entebbe', 'entebbe'),
    ('Jinja', 'jinja')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'ug' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 10: Bulk Insert Cities for Algeria ('dz' - 3 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Algiers', 'algiers'),
    ('Oran', 'oran'),
    ('Constantine', 'constantine')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'dz' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 11: Bulk Insert Cities for Ethiopia ('et' - 3 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Addis Ababa', 'addis-ababa'),
    ('Dire Dawa', 'dire-dawa'),
    ('Mekelle', 'mekelle')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'et' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 12: Verification Query
-- =========================================================================
SELECT 
  co.name AS country_name,
  co.code AS country_code,
  COUNT(ci.id) AS total_cities
FROM public.countries co
JOIN public.cities ci ON ci.country_id = co.id
WHERE lower(co.code) IN ('ng', 'za', 'eg', 'ke', 'gh', 'ma', 'tz', 'ug', 'dz', 'et')
GROUP BY co.name, co.code
ORDER BY total_cities DESC, co.name ASC;
