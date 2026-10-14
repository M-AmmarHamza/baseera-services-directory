-- =========================================================================
-- BASEERA (بصیرہ) - ENTERPRISE POSTGRESQL SCHEMA & RLS POLICIES
-- Platform: Global / Local Services Directory
-- Authentication: Supabase Google OAuth (auth.users)
-- Author: Senior Supabase & PostgreSQL Architect
-- =========================================================================

-- 1. EXTENSIONS
create extension if not exists "pgcrypto";    -- Built-in gen_random_uuid()
create extension if not exists "pg_trgm";      -- Fuzzy trigram search optimization

-- 2. CUSTOM ENUMS
do $$ begin
  if not exists (select 1 from pg_type where typname = 'service_mode_enum') then
    create type public.service_mode_enum as enum ('home_visit', 'shop_only', 'both');
  end if;

  if not exists (select 1 from pg_type where typname = 'contact_method_enum') then
    create type public.contact_method_enum as enum ('whatsapp', 'telegram', 'phone', 'email');
  end if;
end $$;

-- 3. UPDATED_AT TRIGGER FUNCTION
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- =========================================================================
-- 4. TABLE DEFINITIONS
-- =========================================================================

-- 4.1 COUNTRIES TABLE
create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null, -- ISO 2-letter code in lowercase: e.g. 'pk', 'ae', 'sa'
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- 4.2 CITIES TABLE
create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries(id) on delete cascade,
  name text not null,
  slug text not null, -- ASCII slug: e.g. 'karachi', 'lahore', 'dubai'
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint unique_country_city_slug unique (country_id, slug)
);

-- 4.3 CATEGORIES TABLE
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, -- e.g. 'electrician', 'plumbing', 'ac-repair'
  icon_url text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- 4.4 CATEGORY TRANSLATIONS TABLE (Multi-language Support)
create table if not exists public.category_translations (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  lang_code text not null, -- e.g. 'en', 'ur', 'ar'
  name text not null, -- Translated display name
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint unique_category_lang unique (category_id, lang_code)
);

-- 4.5 PROVIDERS TABLE (Core Directory Entity)
create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null, -- Link to Google Auth user
  city_id uuid not null references public.cities(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  business_name text not null,
  slug text unique not null, -- Unique URL identifier: e.g. 'tariq-electric-works'
  whatsapp_number text not null, -- Clean international format: e.g. '+923001234567'
  description text,
  service_mode public.service_mode_enum not null default 'both',
  address text,
  google_map_url text,
  is_verified boolean not null default false, -- Requires administrative verification
  is_available boolean not null default true, -- Provider toggle: "Available for Work Today"
  contact_method public.contact_method_enum not null default 'whatsapp',
  contact_value text, -- WhatsApp number, telegram handle, phone, or email
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Providers updated_at Trigger
drop trigger if exists tr_providers_updated_at on public.providers;
create trigger tr_providers_updated_at
  before update on public.providers
  for each row execute function public.handle_updated_at();

-- 4.6 PROVIDER PHOTOS TABLE (Gallery / Portfolio)
create table if not exists public.provider_photos (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  image_url text not null,
  is_cover boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- 4.7 PROVIDER CUSTOM FIELDS TABLE (Flexible Extensible Attributes)
create table if not exists public.provider_custom_fields (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  field_name text not null, -- e.g. 'experience_years', 'emergency_response_time', 'warranty'
  field_value text not null, -- e.g. '15 Years', '30 Minutes', '7-Day Service Warranty'
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint unique_provider_field unique (provider_id, field_name)
);

-- 4.8 SAVED PROFILES TABLE (User Bookmarks / Favorites)
create table if not exists public.saved_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade, -- Google Auth user
  provider_id uuid not null references public.providers(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint unique_user_provider_bookmark unique (user_id, provider_id)
);

-- =========================================================================
-- 5. PERFORMANCE INDEXES (Optimized for High-Traffic Directory Lookups)
-- =========================================================================

-- Foreign Key Indexes
create index if not exists idx_cities_country_id on public.cities(country_id);
create index if not exists idx_category_translations_cat_id on public.category_translations(category_id);
create index if not exists idx_providers_user_id on public.providers(user_id);
create index if not exists idx_providers_city_id on public.providers(city_id);
create index if not exists idx_providers_category_id on public.providers(category_id);
create index if not exists idx_provider_photos_provider_id on public.provider_photos(provider_id);
create index if not exists idx_provider_custom_fields_provider_id on public.provider_custom_fields(provider_id);
create index if not exists idx_saved_profiles_user_id on public.saved_profiles(user_id);
create index if not exists idx_saved_profiles_provider_id on public.saved_profiles(provider_id);

-- Directory Query Routing Indexes
create index if not exists idx_countries_code on public.countries(code);
create index if not exists idx_cities_slug on public.cities(slug);
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_category_translations_lookup on public.category_translations(category_id, lang_code);
create index if not exists idx_providers_slug on public.providers(slug);
create index if not exists idx_providers_city_cat on public.providers(city_id, category_id);
create index if not exists idx_providers_availability on public.providers(is_verified, is_available);

-- Partial Index: Quick Cover Photo Retrieval
create index if not exists idx_provider_photos_cover on public.provider_photos(provider_id) where is_cover = true;

-- GIN Trigram Search Index for instant fuzzy matching on business names
create index if not exists idx_providers_business_name_trgm on public.providers using gin (business_name gin_trgm_ops);

-- =========================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS across all tables
alter table public.countries enable row level security;
alter table public.cities enable row level security;
alter table public.categories enable row level security;
alter table public.category_translations enable row level security;
alter table public.providers enable row level security;
alter table public.provider_photos enable row level security;
alter table public.provider_custom_fields enable row level security;
alter table public.saved_profiles enable row level security;

-- -------------------------------------------------------------------------
-- 6.1 PUBLIC DIRECTORY POLICIES (Read-Only to Public)
-- -------------------------------------------------------------------------

create policy "Public can view active countries"
  on public.countries for select
  using (is_active = true);

create policy "Public can view active cities"
  on public.cities for select
  using (is_active = true);

create policy "Public can view categories"
  on public.categories for select
  using (true);

create policy "Public can view category translations"
  on public.category_translations for select
  using (true);

-- Making all provider profiles publicly readable as specified
create policy "Public can view all provider profiles"
  on public.providers for select
  using (true);

create policy "Public can view provider photos"
  on public.provider_photos for select
  using (true);

create policy "Public can view provider custom fields"
  on public.provider_custom_fields for select
  using (true);

-- -------------------------------------------------------------------------
-- 6.2 PROVIDER MANAGEMENT POLICIES (Google Auth Authenticated Users)
-- -------------------------------------------------------------------------

-- Providers: Authenticated users can insert their own provider record
create policy "Authenticated users can create own provider profile"
  on public.providers for insert
  with check (auth.uid() = user_id);

-- Providers: Providers can update only their own profile
create policy "Providers can update own profile"
  on public.providers for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Providers: Providers can delete their own profile
create policy "Providers can delete own profile"
  on public.providers for delete
  using (auth.uid() = user_id);

-- Provider Photos: Owner can insert/update/delete photos
create policy "Providers can insert own photos"
  on public.provider_photos for insert
  with check (
    exists (
      select 1 from public.providers p
      where p.id = provider_photos.provider_id
      and p.user_id = auth.uid()
    )
  );

create policy "Providers can update own photos"
  on public.provider_photos for update
  using (
    exists (
      select 1 from public.providers p
      where p.id = provider_photos.provider_id
      and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.providers p
      where p.id = provider_photos.provider_id
      and p.user_id = auth.uid()
    )
  );

create policy "Providers can delete own photos"
  on public.provider_photos for delete
  using (
    exists (
      select 1 from public.providers p
      where p.id = provider_photos.provider_id
      and p.user_id = auth.uid()
    )
  );

-- Provider Custom Fields: Owner can manage custom attributes
create policy "Providers can insert custom fields"
  on public.provider_custom_fields for insert
  with check (
    exists (
      select 1 from public.providers p
      where p.id = provider_custom_fields.provider_id
      and p.user_id = auth.uid()
    )
  );

create policy "Providers can update custom fields"
  on public.provider_custom_fields for update
  using (
    exists (
      select 1 from public.providers p
      where p.id = provider_custom_fields.provider_id
      and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.providers p
      where p.id = provider_custom_fields.provider_id
      and p.user_id = auth.uid()
    )
  );

create policy "Providers can delete custom fields"
  on public.provider_custom_fields for delete
  using (
    exists (
      select 1 from public.providers p
      where p.id = provider_custom_fields.provider_id
      and p.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------------------
-- 6.3 SAVED PROFILES (BOOKMARKS) POLICIES
-- -------------------------------------------------------------------------

create policy "Users can view own saved profiles"
  on public.saved_profiles for select
  using (auth.uid() = user_id);

create policy "Users can bookmark a provider"
  on public.saved_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can remove a bookmarked provider"
  on public.saved_profiles for delete
  using (auth.uid() = user_id);

-- =========================================================================
-- 7. SUPABASE STORAGE BUCKETS & RLS
-- =========================================================================

-- 7.1 CREATE BUCKETS
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  (
    'provider-portfolios',
    'provider-portfolios',
    true,
    5242880, -- 5 MB limit
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'secure-documents',
    'secure-documents',
    false, -- STRICTLY PRIVATE
    10485760, -- 10 MB limit
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- -------------------------------------------------------------------------
-- 7.2 BUCKET 1: 'provider-portfolios' (Public Gallery & Avatars)
-- -------------------------------------------------------------------------

-- Public CDN read access
create policy "Public portfolio viewable by everyone"
  on storage.objects for select
  using (bucket_id = 'provider-portfolios');

-- Authenticated providers can upload to their user folder: provider-portfolios/{user_id}/*
create policy "Authenticated users can upload portfolio images"
  on storage.objects for insert
  with check (
    bucket_id = 'provider-portfolios'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated providers can update their own images
create policy "Users can update own portfolio images"
  on storage.objects for update
  using (
    bucket_id = 'provider-portfolios'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated providers can delete their own portfolio images
create policy "Users can delete own portfolio images"
  on storage.objects for delete
  using (
    bucket_id = 'provider-portfolios'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- -------------------------------------------------------------------------
-- 7.3 BUCKET 2: 'secure-documents' (Private Verification Documents, CNIC, Trade License)
-- -------------------------------------------------------------------------

-- Authenticated provider can upload verification docs to secure-documents/{user_id}/*
create policy "Providers can upload verification documents"
  on storage.objects for insert
  with check (
    bucket_id = 'secure-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Provider can view their own uploaded verification documents
create policy "Providers can view own uploaded verification documents"
  on storage.objects for select
  using (
    bucket_id = 'secure-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- STRICT ADMIN-ONLY: View and manage all verification documents
-- Checks Supabase JWT app_metadata for { "role": "admin" } or service_role
create policy "Admins have full access to secure documents"
  on storage.objects for all
  using (
    bucket_id = 'secure-documents'
    and (
      coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
      or auth.role() = 'service_role'
    )
  )
  with check (
    bucket_id = 'secure-documents'
    and (
      coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
      or auth.role() = 'service_role'
    )
  );
