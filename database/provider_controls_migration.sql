-- =========================================================================
-- BASEERA DIRECTORY: PROVIDER MANAGEMENT & CONTROLS SCHEMA MIGRATION
-- Adds granular controls: status (pending, published, suspended), 
-- seo_index, is_featured, is_verified
-- =========================================================================

-- 1. Ensure seo_index column exists on public.providers
alter table if exists public.providers 
  add column if not exists seo_index boolean default false;

-- 2. Update status column constraint to support 'published' and 'suspended'
alter table if exists public.providers 
  drop constraint if exists providers_status_check;

alter table if exists public.providers 
  add constraint providers_status_check 
  check (status in ('pending', 'published', 'suspended', 'approved', 'rejected'));

-- 3. Migrate existing 'approved' records to 'published'
update public.providers 
set status = 'published' 
where status = 'approved';

-- 4. Ensure existing verified/published providers have seo_index enabled by default
update public.providers 
set seo_index = true 
where (status = 'published' or is_verified = true) and seo_index is null;

-- 5. Ensure column defaults
alter table if exists public.providers 
  alter column status set default 'pending',
  alter column seo_index set default false,
  alter column is_featured set default false,
  alter column is_verified set default false;

-- 6. Performance indexes for Provider Management queries
create index if not exists idx_providers_status on public.providers (status);
create index if not exists idx_providers_seo_index on public.providers (seo_index);
create index if not exists idx_providers_is_featured on public.providers (is_featured);
create index if not exists idx_providers_is_verified on public.providers (is_verified);
