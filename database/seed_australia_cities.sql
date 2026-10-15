-- =========================================================================
-- BASEERA (بصیرہ) - AUSTRALIA (10 CITIES) SEED SCRIPT
-- Country: Australia (Code: 'au') - 10 Major Cities
--
-- Compatible with both UUID (gen_random_uuid()) and SERIAL primary key schemas.
-- =========================================================================

-- =========================================================================
-- STEP 1: Ensure Australia Exists in `public.countries`
-- =========================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'au') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug'
    ) THEN
      INSERT INTO public.countries (name, code, slug) VALUES ('Australia', 'au', 'australia');
    ELSE
      INSERT INTO public.countries (name, code) VALUES ('Australia', 'au');
    END IF;
  END IF;
END $$;

-- =========================================================================
-- STEP 2: Bulk Insert 10 Major Cities for Australia ('au')
-- =========================================================================
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Sydney', 'sydney'),
    ('Melbourne', 'melbourne'),
    ('Brisbane', 'brisbane'),
    ('Perth', 'perth'),
    ('Adelaide', 'adelaide'),
    ('Gold Coast', 'gold-coast'),
    ('Canberra', 'canberra'),
    ('Newcastle', 'newcastle'),
    ('Hobart', 'hobart'),
    ('Darwin', 'darwin')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'au' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- =========================================================================
-- STEP 3: Verification Query
-- =========================================================================
SELECT 
  co.name AS country_name,
  co.code AS country_code,
  COUNT(ci.id) AS total_cities
FROM public.countries co
JOIN public.cities ci ON ci.country_id = co.id
WHERE lower(co.code) = 'au'
GROUP BY co.name, co.code;
