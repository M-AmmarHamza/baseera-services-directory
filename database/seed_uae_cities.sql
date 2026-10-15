-- =========================================================================
-- BASEERA (بصیرہ) - UNITED ARAB EMIRATES (UAE) 8 CITIES SEED SCRIPT
-- Country: United Arab Emirates (Code: 'ae')
--
-- This script populates the `cities` table for the United Arab Emirates
-- with the 7 Emirates + major city of Al Ain and their exact routing slugs.
-- Compatible with both UUID (gen_random_uuid()) and SERIAL primary key schemas.
-- =========================================================================

-- Step 1: Ensure United Arab Emirates country record exists in `public.countries`
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'ae') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug'
    ) THEN
      INSERT INTO public.countries (name, code, slug) 
      VALUES ('United Arab Emirates', 'ae', 'uae');
    ELSE
      INSERT INTO public.countries (name, code) 
      VALUES ('United Arab Emirates', 'ae');
    END IF;
  END IF;
END $$;

-- Step 2: Bulk Insert or Update the 7 Emirates + Al Ain
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Dubai', 'dubai'),
    ('Abu Dhabi', 'abu-dhabi'),
    ('Sharjah', 'sharjah'),
    ('Ajman', 'ajman'),
    ('Ras Al Khaimah', 'ras-al-khaimah'),
    ('Fujairah', 'fujairah'),
    ('Umm Al Quwain', 'umm-al-quwain'),
    ('Al Ain', 'al-ain')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'ae' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- Step 3: Verification Query to confirm all 8 UAE cities are active
SELECT 
  c.id,
  c.name AS city_name,
  c.slug AS city_slug,
  co.name AS country_name,
  co.code AS country_code,
  c.is_active
FROM public.cities c
JOIN public.countries co ON c.country_id = co.id
WHERE lower(co.code) = 'ae'
ORDER BY c.name ASC;
