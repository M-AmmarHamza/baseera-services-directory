-- =========================================================================
-- BASEERA DIRECTORY - PHASE 3: SEO, 301 REDIRECTS, ADS, SETTINGS & STAFF MIGRATION
-- =========================================================================

-- 1. Create Redirect Rules Table for Dynamic 301/302 Redirect Engine
CREATE TABLE IF NOT EXISTS redirect_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path VARCHAR(500) UNIQUE NOT NULL,
  destination_path VARCHAR(500) NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_redirect_rules_source ON redirect_rules(source_path);
CREATE INDEX IF NOT EXISTS idx_redirect_rules_is_active ON redirect_rules(is_active);

-- 2. Create Site Settings Key-Value Table with JSONB
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Seed Default Master Indexing Switch & Platform Configuration
INSERT INTO site_settings (key, value, updated_at)
VALUES 
  ('global_allow_indexing', 'true'::jsonb, NOW()),
  ('ad_settings', '{
    "adsense_publisher_id": "ca-pub-1234567890123456",
    "placements": {
      "top_banner": true,
      "in_feed": true,
      "profile_sidebar": true,
      "mobile_sticky": false
    },
    "sponsors": []
  }'::jsonb, NOW()),
  ('general_settings', '{
    "brandName": "Baseera",
    "logoUrl": "",
    "supportWhatsapp": "+923001234567",
    "footerLinks": [
      { "label": "About Us", "href": "/about" },
      { "label": "FAQ", "href": "/faq" },
      { "label": "Privacy Policy", "href": "/privacy" },
      { "label": "Terms of Service", "href": "/terms" }
    ]
  }'::jsonb, NOW())
ON CONFLICT (key) DO NOTHING;

-- 4. Seed Canonical Initial 301 Redirect Rules
INSERT INTO redirect_rules (source_path, destination_path, status_code, is_active)
VALUES
  ('/join', '/en/list-service', 301, true),
  ('/vendors', '/en', 301, true),
  ('/old-services', '/en/services', 301, true)
ON CONFLICT (source_path) DO NOTHING;
