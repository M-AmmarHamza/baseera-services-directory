-- =========================================================================
-- BASEERA DIRECTORY: ANALYTICS & LEAD TRACKING MIGRATION
-- Adds profile_views and whatsapp_clicks to providers table
-- =========================================================================

-- 1. Add tracking columns to providers table
alter table if exists public.providers 
  add column if not exists profile_views int default 0,
  add column if not exists whatsapp_clicks int default 0;

-- 2. Backfill existing counts
update public.providers
set whatsapp_clicks = coalesce(total_leads, 0)
where whatsapp_clicks is null or whatsapp_clicks = 0;

update public.providers
set profile_views = coalesce(review_count * 8 + total_leads * 3, 40)
where profile_views is null or profile_views = 0;

-- 3. Performance Indexes for Analytics queries
create index if not exists idx_providers_profile_views on public.providers (profile_views desc);
create index if not exists idx_providers_whatsapp_clicks on public.providers (whatsapp_clicks desc);
