-- =========================================================================
-- BASEERA (بصیرہ) - 5 INTERNATIONAL COUNTRIES (49 CITIES) SEED SCRIPT
-- Countries: 
--   1. United States (Code: 'us') - 15 Cities
--   2. Canada (Code: 'ca') - 10 Cities
--   3. Qatar (Code: 'qa') - 7 Cities
--   4. Kuwait (Code: 'kw') - 7 Cities
--   5. United Kingdom (Code: 'uk' / 'gb') - 10 Cities
--
-- Compatible with both UUID (gen_random_uuid()) and SERIAL primary key schemas.
-- =========================================================================

-- =========================================================================
-- STEP 1: Ensure All 5 Countries Exist in `public.countries`
-- =========================================================================
DO $$
BEGIN
  -- 1. United States
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'us') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug'
    ) THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('United States', 'us', 'united-states');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('United States', 'us');
    END IF;
  END IF;

  -- 2. Canada
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'ca') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug'
    ) THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Canada', 'ca', 'canada');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Canada', 'ca');
    END IF;
  END IF;

  -- 3. Qatar
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'qa') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug'
    ) THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Qatar', 'qa', 'qatar');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Qatar', 'qa');
    END IF;
  END IF;

  -- 4. Kuwait
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'kw') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug'
    ) THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Kuwait', 'kw', 'kuwait');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Kuwait', 'kw');
    END IF;
  END IF;

  -- 5. United Kingdom ('uk' or 'gb')
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) IN ('uk', 'gb')) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug'
    ) THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('United Kingdom', 'uk', 'united-kingdom');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('United Kingdom', 'uk');
    END IF;
  END IF;
END $$;

-- =========================================================================
-- STEP 2: Bulk Insert Cities for United States (15 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('New York', 'new-york'),
    ('Los Angeles', 'los-angeles'),
    ('Chicago', 'chicago'),
    ('Houston', 'houston'),
    ('Phoenix', 'phoenix'),
    ('Philadelphia', 'philadelphia'),
    ('San Antonio', 'san-antonio'),
    ('San Diego', 'san-diego'),
    ('Dallas', 'dallas'),
    ('San Jose', 'san-jose'),
    ('Austin', 'austin'),
    ('San Francisco', 'san-francisco'),
    ('Seattle', 'seattle'),
    ('Denver', 'denver'),
    ('Washington', 'washington')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'us' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 3: Bulk Insert Cities for Canada (10 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Toronto', 'toronto'),
    ('Montreal', 'montreal'),
    ('Vancouver', 'vancouver'),
    ('Calgary', 'calgary'),
    ('Edmonton', 'edmonton'),
    ('Ottawa', 'ottawa'),
    ('Winnipeg', 'winnipeg'),
    ('Quebec City', 'quebec-city'),
    ('Hamilton', 'hamilton'),
    ('Halifax', 'halifax')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'ca' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 4: Bulk Insert Cities for Qatar (7 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Doha', 'doha'),
    ('Al Rayyan', 'al-rayyan'),
    ('Al Wakrah', 'al-wakrah'),
    ('Al Khor', 'al-khor'),
    ('Umm Salal', 'umm-salal'),
    ('Lusail', 'lusail'),
    ('Madinat ash Shamal', 'madinat-ash-shamal')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'qa' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 5: Bulk Insert Cities for Kuwait (7 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Kuwait City', 'kuwait-city'),
    ('Al Ahmadi', 'al-ahmadi'),
    ('Hawalli', 'hawalli'),
    ('Salmiya', 'salmiya'),
    ('Al Farwaniyah', 'al-farwaniyah'),
    ('Al Jahra', 'al-jahra'),
    ('Mubarak Al-Kabeer', 'mubarak-al-kabeer')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'kw' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 6: Bulk Insert Cities for United Kingdom (10 Cities)
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('London', 'london'),
    ('Birmingham', 'birmingham'),
    ('Manchester', 'manchester'),
    ('Glasgow', 'glasgow'),
    ('Liverpool', 'liverpool'),
    ('Edinburgh', 'edinburgh'),
    ('Leeds', 'leeds'),
    ('Sheffield', 'sheffield'),
    ('Bristol', 'bristol'),
    ('Cardiff', 'cardiff')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) IN ('uk', 'gb') LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 7: Verification Query (Confirming all 49 cities across 5 countries)
-- =========================================================================
SELECT 
  co.name AS country_name,
  co.code AS country_code,
  count(c.id) AS total_cities
FROM public.cities c
JOIN public.countries co ON c.country_id = co.id
WHERE lower(co.code) IN ('us', 'ca', 'qa', 'kw', 'uk', 'gb')
GROUP BY co.name, co.code
ORDER BY total_cities DESC;
