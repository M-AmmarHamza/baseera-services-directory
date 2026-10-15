-- =========================================================================
-- BASEERA (بصیرہ) - SAUDI ARABIA TOP 16 MAJOR CITIES SEED SCRIPT
-- Country: Saudi Arabia (Code: 'sa')
--
-- This script populates the `cities` table for the Kingdom of Saudi Arabia
-- with the Top 16 major metropolitan cities and their exact routing slugs.
-- Compatible with both UUID (gen_random_uuid()) and SERIAL primary key schemas.
-- =========================================================================

-- Step 1: Ensure Saudi Arabia country record exists in `public.countries`
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'sa') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug'
    ) THEN
      INSERT INTO public.countries (name, code, slug) 
      VALUES ('Saudi Arabia', 'sa', 'saudi-arabia');
    ELSE
      INSERT INTO public.countries (name, code) 
      VALUES ('Saudi Arabia', 'sa');
    END IF;
  END IF;
END $$;

-- Step 2: Bulk Insert or Update the Top 16 Major Cities of Saudi Arabia
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Riyadh', 'riyadh'),
    ('Jeddah', 'jeddah'),
    ('Makkah', 'makkah'),
    ('Madinah', 'madinah'),
    ('Dammam', 'dammam'),
    ('Khobar', 'khobar'),
    ('Dhahran', 'dhahran'),
    ('Jubail', 'jubail'),
    ('Taif', 'taif'),
    ('Tabuk', 'tabuk'),
    ('Abha', 'abha'),
    ('Buraydah', 'buraydah'),
    ('Yanbu', 'yanbu'),
    ('Najran', 'najran'),
    ('Al Qatif', 'al-qatif'),
    ('Hail', 'hail')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'sa' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- Step 3: Verification Query to confirm all 16 Saudi cities are active
SELECT 
  c.id,
  c.name AS city_name,
  c.slug AS city_slug,
  co.name AS country_name,
  co.code AS country_code,
  c.is_active
FROM public.cities c
JOIN public.countries co ON c.country_id = co.id
WHERE lower(co.code) = 'sa'
ORDER BY c.name ASC;
