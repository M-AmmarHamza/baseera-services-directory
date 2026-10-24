-- =========================================================================
-- BASEERA DIRECTORY: FREEMIUM SUBSCRIPTION MODEL MIGRATION (FREE VS. PREMIUM)
-- Adds is_premium, gallery_images, google_map_url, target_areas, certificates
-- =========================================================================

-- 1. Add is_premium boolean flag (default false for Free Tier)
alter table if exists public.providers 
  add column if not exists is_premium boolean default false;

-- 2. Add bio (text) and profile_picture (text)
alter table if exists public.providers 
  add column if not exists bio text,
  add column if not exists profile_picture text;

-- 3. Add Premium-only fields: gallery_images, google_map_url, target_areas, certificates
alter table if exists public.providers 
  add column if not exists gallery_images text[] default '{}',
  add column if not exists google_map_url text,
  add column if not exists target_areas text[] default '{}',
  add column if not exists certificates text[] default '{}';

-- 4. Backfill existing fields from legacy columns:
-- bio from short_bio
update public.providers 
set bio = short_bio 
where bio is null and short_bio is not null;

-- profile_picture from avatar_url
update public.providers 
set profile_picture = avatar_url 
where profile_picture is null and avatar_url is not null;

-- target_areas from service_area
update public.providers 
set target_areas = service_area 
where (target_areas is null or cardinality(target_areas) = 0) and service_area is not null;

-- gallery_images from portfolio_photos
update public.providers 
set gallery_images = portfolio_photos 
where (gallery_images is null or cardinality(gallery_images) = 0) and portfolio_photos is not null;

-- Set top seed/featured providers to premium if verified
update public.providers 
set is_premium = true 
where is_featured = true and is_verified = true;

-- 5. Performance Indexes
create index if not exists idx_providers_is_premium on public.providers (is_premium);
