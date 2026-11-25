-- =========================================================================
-- BASEERA DIRECTORY - PHASE 2: DYNAMIC TAXONOMY & FAQS CMS MIGRATION
-- Applies schema alterations for Country, City, Category and creates Faqs
-- =========================================================================

-- 1. Extend Countries Table
ALTER TABLE IF EXISTS countries
  ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
  ADD COLUMN IF NOT EXISTS name_ur VARCHAR(255),
  ADD COLUMN IF NOT EXISTS premium_price INTEGER DEFAULT 2500,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing records with default English name if empty
UPDATE countries SET name_en = name WHERE name_en IS NULL;

-- 2. Extend Cities Table
ALTER TABLE IF EXISTS cities
  ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
  ADD COLUMN IF NOT EXISTS name_ur VARCHAR(255),
  ADD COLUMN IF NOT EXISTS target_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

UPDATE cities SET name_en = name WHERE name_en IS NULL;

-- 3. Extend Categories Table
ALTER TABLE IF EXISTS categories
  ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
  ADD COLUMN IF NOT EXISTS name_ur VARCHAR(255),
  ADD COLUMN IF NOT EXISTS slug_en VARCHAR(255),
  ADD COLUMN IF NOT EXISTS slug_ur VARCHAR(255),
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

UPDATE categories SET name_en = name, slug_en = slug WHERE name_en IS NULL;

-- 4. Create FaqScope Enum & Faqs Table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'faq_scope') THEN
    CREATE TYPE faq_scope AS ENUM ('GLOBAL', 'CATEGORY');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope VARCHAR(20) NOT NULL DEFAULT 'GLOBAL',
  category_id VARCHAR(100) REFERENCES categories(id) ON DELETE SET NULL,
  question_en TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  question_ur TEXT,
  answer_ur TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_scope ON faqs(scope);
CREATE INDEX IF NOT EXISTS idx_faqs_category_id ON faqs(category_id);
CREATE INDEX IF NOT EXISTS idx_faqs_sort_order ON faqs(sort_order);
