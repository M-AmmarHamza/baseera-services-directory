-- =========================================================================
-- BASEERA (بصیرہ) - TOP 10 EUROPEAN COUNTRIES (42 CITIES) SEED SCRIPT
-- Countries:
--   1. Germany (Code: 'de') - 5 Cities
--   2. France (Code: 'fr') - 5 Cities
--   3. Italy (Code: 'it') - 5 Cities
--   4. Spain (Code: 'es') - 5 Cities
--   5. Netherlands (Code: 'nl') - 5 Cities
--   6. Sweden (Code: 'se') - 3 Cities
--   7. Switzerland (Code: 'ch') - 4 Cities
--   8. Belgium (Code: 'be') - 3 Cities
--   9. Austria (Code: 'at') - 3 Cities
--  10. Poland (Code: 'pl') - 4 Cities
--
-- Compatible with both UUID (gen_random_uuid()) and SERIAL primary key schemas.
-- =========================================================================

-- =========================================================================
-- STEP 1: Ensure All 10 European Countries Exist in `public.countries`
-- =========================================================================
DO $$
BEGIN
  -- 1. Germany ('de')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'de') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Germany', 'de', 'germany');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Germany', 'de');
    END IF;
  END IF;

  -- 2. France ('fr')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'fr') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('France', 'fr', 'france');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('France', 'fr');
    END IF;
  END IF;

  -- 3. Italy ('it')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'it') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Italy', 'it', 'italy');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Italy', 'it');
    END IF;
  END IF;

  -- 4. Spain ('es')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'es') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Spain', 'es', 'spain');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Spain', 'es');
    END IF;
  END IF;

  -- 5. Netherlands ('nl')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'nl') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Netherlands', 'nl', 'netherlands');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Netherlands', 'nl');
    END IF;
  END IF;

  -- 6. Sweden ('se')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'se') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Sweden', 'se', 'sweden');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Sweden', 'se');
    END IF;
  END IF;

  -- 7. Switzerland ('ch')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'ch') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Switzerland', 'ch', 'switzerland');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Switzerland', 'ch');
    END IF;
  END IF;

  -- 8. Belgium ('be')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'be') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Belgium', 'be', 'belgium');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Belgium', 'be');
    END IF;
  END IF;

  -- 9. Austria ('at')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'at') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Austria', 'at', 'austria');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Austria', 'at');
    END IF;
  END IF;

  -- 10. Poland ('pl')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'pl') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug') THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Poland', 'pl', 'poland');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Poland', 'pl');
    END IF;
  END IF;
END $$;

-- =========================================================================
-- STEP 2: Bulk Insert Cities for Germany ('de' - 5 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Berlin', 'berlin'),
    ('Munich', 'munich'),
    ('Frankfurt', 'frankfurt'),
    ('Hamburg', 'hamburg'),
    ('Cologne', 'cologne')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'de' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 3: Bulk Insert Cities for France ('fr' - 5 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Paris', 'paris'),
    ('Marseille', 'marseille'),
    ('Lyon', 'lyon'),
    ('Toulouse', 'toulouse'),
    ('Nice', 'nice')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'fr' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 4: Bulk Insert Cities for Italy ('it' - 5 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Rome', 'rome'),
    ('Milan', 'milan'),
    ('Naples', 'naples'),
    ('Turin', 'turin'),
    ('Florence', 'florence')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'it' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 5: Bulk Insert Cities for Spain ('es' - 5 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Madrid', 'madrid'),
    ('Barcelona', 'barcelona'),
    ('Valencia', 'valencia'),
    ('Seville', 'seville'),
    ('Zaragoza', 'zaragoza')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'es' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 6: Bulk Insert Cities for Netherlands ('nl' - 5 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Amsterdam', 'amsterdam'),
    ('Rotterdam', 'rotterdam'),
    ('The Hague', 'the-hague'),
    ('Utrecht', 'utrecht'),
    ('Eindhoven', 'eindhoven')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'nl' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 7: Bulk Insert Cities for Sweden ('se' - 3 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Stockholm', 'stockholm'),
    ('Gothenburg', 'gothenburg'),
    ('Malmo', 'malmo')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'se' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 8: Bulk Insert Cities for Switzerland ('ch' - 4 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Zurich', 'zurich'),
    ('Geneva', 'geneva'),
    ('Basel', 'basel'),
    ('Bern', 'bern')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'ch' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 9: Bulk Insert Cities for Belgium ('be' - 3 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Brussels', 'brussels'),
    ('Antwerp', 'antwerp'),
    ('Ghent', 'ghent')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'be' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 10: Bulk Insert Cities for Austria ('at' - 3 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Vienna', 'vienna'),
    ('Graz', 'graz'),
    ('Linz', 'linz')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'at' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 11: Bulk Insert Cities for Poland ('pl' - 4 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Warsaw', 'warsaw'),
    ('Krakow', 'krakow'),
    ('Lodz', 'lodz'),
    ('Wroclaw', 'wroclaw')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'pl' LIMIT 1
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
WHERE lower(co.code) IN ('de', 'fr', 'it', 'es', 'nl', 'se', 'ch', 'be', 'at', 'pl')
GROUP BY co.name, co.code
ORDER BY total_cities DESC, co.name ASC;
