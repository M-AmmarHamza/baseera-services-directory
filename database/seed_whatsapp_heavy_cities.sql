-- =========================================================================
-- BASEERA (بصیرہ) - 8 WHATSAPP-HEAVY COUNTRIES (24 CITIES) SEED SCRIPT
-- Markets: LATAM, Middle East, Oceania, Eurasia
-- Countries:
--   1. Brazil (Code: 'br') - 3 Cities
--   2. Mexico (Code: 'mx') - 3 Cities
--   3. Colombia (Code: 'co') - 3 Cities
--   4. Oman (Code: 'om') - 3 Cities
--   5. Bahrain (Code: 'bh') - 3 Cities
--   6. New Zealand (Code: 'nz') - 3 Cities
--   7. Turkey (Code: 'tr') - 3 Cities
--   8. Ireland (Code: 'ie') - 3 Cities
--
-- Compatible with both UUID (gen_random_uuid()) and SERIAL primary key schemas.
-- =========================================================================

-- =========================================================================
-- STEP 1: Ensure All 8 Countries Exist in `public.countries`
-- =========================================================================
DO $$
BEGIN
  -- 1. Brazil ('br')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'br') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Brazil', 'br', 'brazil');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Brazil', 'br');
    END IF;
  END IF;

  -- 2. Mexico ('mx')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'mx') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Mexico', 'mx', 'mexico');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Mexico', 'mx');
    END IF;
  END IF;

  -- 3. Colombia ('co')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'co') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Colombia', 'co', 'colombia');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Colombia', 'co');
    END IF;
  END IF;

  -- 4. Oman ('om')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'om') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Oman', 'om', 'oman');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Oman', 'om');
    END IF;
  END IF;

  -- 5. Bahrain ('bh')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'bh') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Bahrain', 'bh', 'bahrain');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Bahrain', 'bh');
    END IF;
  END IF;

  -- 6. New Zealand ('nz')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'nz') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('New Zealand', 'nz', 'new-zealand');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('New Zealand', 'nz');
    END IF;
  END IF;

  -- 7. Turkey ('tr')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'tr') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Turkey', 'tr', 'turkey');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Turkey', 'tr');
    END IF;
  END IF;

  -- 8. Ireland ('ie')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'ie') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Ireland', 'ie', 'ireland');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Ireland', 'ie');
    END IF;
  END IF;
END $$;

-- =========================================================================
-- STEP 2: Bulk Insert Cities for Brazil ('br' - 3 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Sao Paulo', 'sao-paulo'),
    ('Rio de Janeiro', 'rio-de-janeiro'),
    ('Brasilia', 'brasilia')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'br' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 3: Bulk Insert Cities for Mexico ('mx' - 3 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Mexico City', 'mexico-city'),
    ('Guadalajara', 'guadalajara'),
    ('Monterrey', 'monterrey')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'mx' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 4: Bulk Insert Cities for Colombia ('co' - 3 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Bogota', 'bogota'),
    ('Medellin', 'medellin'),
    ('Cali', 'cali')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'co' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 5: Bulk Insert Cities for Oman ('om' - 3 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Muscat', 'muscat'),
    ('Salalah', 'salalah'),
    ('Sohar', 'sohar')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'om' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 6: Bulk Insert Cities for Bahrain ('bh' - 3 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Manama', 'manama'),
    ('Muharraq', 'muharraq'),
    ('Riffa', 'riffa')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'bh' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 7: Bulk Insert Cities for New Zealand ('nz' - 3 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Auckland', 'auckland'),
    ('Wellington', 'wellington'),
    ('Christchurch', 'christchurch')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'nz' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 8: Bulk Insert Cities for Turkey ('tr' - 3 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Istanbul', 'istanbul'),
    ('Ankara', 'ankara'),
    ('Izmir', 'izmir')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'tr' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 9: Bulk Insert Cities for Ireland ('ie' - 3 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Dublin', 'dublin'),
    ('Cork', 'cork'),
    ('Galway', 'galway')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'ie' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 10: Verification Query
-- =========================================================================
SELECT 
  co.name AS country_name,
  co.code AS country_code,
  COUNT(ci.id) AS total_cities
FROM public.countries co
JOIN public.cities ci ON ci.country_id = co.id
WHERE lower(co.code) IN ('br', 'mx', 'co', 'om', 'bh', 'nz', 'tr', 'ie')
GROUP BY co.name, co.code
ORDER BY co.name ASC;
