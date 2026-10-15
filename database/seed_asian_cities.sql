-- =========================================================================
-- BASEERA (بصیرہ) - TOP ASIAN COUNTRIES (33 CITIES) SEED SCRIPT
-- Countries:
--   1. Indonesia (Code: 'id') - 5 Cities
--   2. Malaysia (Code: 'my') - 4 Cities
--   3. Singapore (Code: 'sg') - 1 City
--   4. Philippines (Code: 'ph') - 4 Cities
--   5. Thailand (Code: 'th') - 4 Cities
--   6. Vietnam (Code: 'vn') - 3 Cities
--   7. Bangladesh (Code: 'bd') - 4 Cities
--   8. Japan (Code: 'jp') - 4 Cities
--   9. South Korea (Code: 'kr') - 4 Cities
--
-- Compatible with both UUID (gen_random_uuid()) and SERIAL primary key schemas.
-- =========================================================================

-- =========================================================================
-- STEP 1: Ensure All 9 Asian Countries Exist in `public.countries`
-- =========================================================================
DO $$
BEGIN
  -- 1. Indonesia ('id')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'id') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Indonesia', 'id', 'indonesia');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Indonesia', 'id');
    END IF;
  END IF;

  -- 2. Malaysia ('my')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'my') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Malaysia', 'my', 'malaysia');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Malaysia', 'my');
    END IF;
  END IF;

  -- 3. Singapore ('sg')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'sg') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Singapore', 'sg', 'singapore');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Singapore', 'sg');
    END IF;
  END IF;

  -- 4. Philippines ('ph')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'ph') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Philippines', 'ph', 'philippines');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Philippines', 'ph');
    END IF;
  END IF;

  -- 5. Thailand ('th')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'th') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Thailand', 'th', 'thailand');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Thailand', 'th');
    END IF;
  END IF;

  -- 6. Vietnam ('vn')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'vn') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Vietnam', 'vn', 'vietnam');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Vietnam', 'vn');
    END IF;
  END IF;

  -- 7. Bangladesh ('bd')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'bd') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Bangladesh', 'bd', 'bangladesh');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Bangladesh', 'bd');
    END IF;
  END IF;

  -- 8. Japan ('jp')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'jp') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Japan', 'jp', 'japan');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Japan', 'jp');
    END IF;
  END IF;

  -- 9. South Korea ('kr')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'kr') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('South Korea', 'kr', 'south-korea');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('South Korea', 'kr');
    END IF;
  END IF;
END $$;

-- =========================================================================
-- STEP 2: Bulk Insert Cities for Indonesia ('id' - 5 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Jakarta', 'jakarta'),
    ('Surabaya', 'surabaya'),
    ('Bandung', 'bandung'),
    ('Medan', 'medan'),
    ('Denpasar', 'denpasar')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'id' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 3: Bulk Insert Cities for Malaysia ('my' - 4 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Kuala Lumpur', 'kuala-lumpur'),
    ('George Town', 'george-town'),
    ('Johor Bahru', 'johor-bahru'),
    ('Shah Alam', 'shah-alam')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'my' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 4: Bulk Insert Cities for Singapore ('sg' - 1 City)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Singapore City', 'singapore-city')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'sg' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 5: Bulk Insert Cities for Philippines ('ph' - 4 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Manila', 'manila'),
    ('Quezon City', 'quezon-city'),
    ('Cebu City', 'cebu-city'),
    ('Davao City', 'davao-city')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'ph' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 6: Bulk Insert Cities for Thailand ('th' - 4 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Bangkok', 'bangkok'),
    ('Chiang Mai', 'chiang-mai'),
    ('Phuket', 'phuket'),
    ('Pattaya', 'pattaya')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'th' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 7: Bulk Insert Cities for Vietnam ('vn' - 3 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Ho Chi Minh City', 'ho-chi-minh-city'),
    ('Hanoi', 'hanoi'),
    ('Da Nang', 'da-nang')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'vn' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 8: Bulk Insert Cities for Bangladesh ('bd' - 4 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Dhaka', 'dhaka'),
    ('Chittagong', 'chittagong'),
    ('Sylhet', 'sylhet'),
    ('Rajshahi', 'rajshahi')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'bd' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 9: Bulk Insert Cities for Japan ('jp' - 4 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Tokyo', 'tokyo'),
    ('Osaka', 'osaka'),
    ('Yokohama', 'yokohama'),
    ('Kyoto', 'kyoto')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'jp' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 10: Bulk Insert Cities for South Korea ('kr' - 4 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Seoul', 'seoul'),
    ('Busan', 'busan'),
    ('Incheon', 'incheon'),
    ('Daegu', 'daegu')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'kr' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 11: Verification Query
-- =========================================================================
SELECT 
  co.name AS country_name,
  co.code AS country_code,
  COUNT(ci.id) AS total_cities
FROM public.countries co
JOIN public.cities ci ON ci.country_id = co.id
WHERE lower(co.code) IN ('id', 'my', 'sg', 'ph', 'th', 'vn', 'bd', 'jp', 'kr')
GROUP BY co.name, co.code
ORDER BY total_cities DESC, co.name ASC;
