-- =========================================================================
-- BASEERA (بصیرہ) - PAKISTAN TOP 30 CITIES SEED SCRIPT
-- Country: Pakistan (Code: 'pk')
--
-- This script populates the `cities` table for Pakistan with the Top 30
-- cities and their exact routing slugs.
-- Compatible with both UUID and SERIAL primary key schemas.
-- =========================================================================

-- Step 1: Ensure Pakistan country record exists in `public.countries`
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.countries WHERE lower(code) = 'pk') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'countries' AND column_name = 'slug'
    ) THEN
      INSERT INTO public.countries (name, code, slug) 
      VALUES ('Pakistan', 'pk', 'pakistan');
    ELSE
      INSERT INTO public.countries (name, code) 
      VALUES ('Pakistan', 'pk');
    END IF;
  END IF;
END $$;

-- Step 2: Insert or Update Top 30 Cities of Pakistan
INSERT INTO public.cities (country_id, name, slug, is_active)
SELECT 
  c.id AS country_id,
  v.name,
  v.slug,
  true AS is_active
FROM (
  VALUES
    ('Karachi', 'karachi'),
    ('Lahore', 'lahore'),
    ('Faisalabad', 'faisalabad'),
    ('Rawalpindi', 'rawalpindi'),
    ('Gujranwala', 'gujranwala'),
    ('Peshawar', 'peshawar'),
    ('Multan', 'multan'),
    ('Hyderabad', 'hyderabad'),
    ('Islamabad', 'islamabad'),
    ('Quetta', 'quetta'),
    ('Bahawalpur', 'bahawalpur'),
    ('Sargodha', 'sargodha'),
    ('Sialkot', 'sialkot'),
    ('Sukkur', 'sukkur'),
    ('Larkana', 'larkana'),
    ('Sheikhupura', 'sheikhupura'),
    ('Rahim Yar Khan', 'rahim-yar-khan'),
    ('Jhang', 'jhang'),
    ('Dera Ghazi Khan', 'dera-ghazi-khan'),
    ('Gujrat', 'gujrat'),
    ('Sahiwal', 'sahiwal'),
    ('Wah Cantonment', 'wah-cantonment'),
    ('Mardan', 'mardan'),
    ('Kasur', 'kasur'),
    ('Okara', 'okara'),
    ('Mingora', 'mingora'),
    ('Nawabshah', 'nawabshah'),
    ('Chiniot', 'chiniot'),
    ('Kotri', 'kotri'),
    ('Kamoke', 'kamoke')
) AS v(name, slug)
CROSS JOIN (
  SELECT id FROM public.countries WHERE lower(code) = 'pk' LIMIT 1
) c
ON CONFLICT (country_id, slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;

-- Step 3: Verification Query to confirm all 30 cities are active
SELECT 
  c.id,
  c.name AS city_name,
  c.slug AS city_slug,
  co.name AS country_name,
  co.code AS country_code,
  c.is_active
FROM public.cities c
JOIN public.countries co ON c.country_id = co.id
WHERE lower(co.code) = 'pk'
ORDER BY c.name ASC;
