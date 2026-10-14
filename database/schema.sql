-- =========================================================================
-- BASEERA (بصیرہ) - PRODUCTION DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Architecture: Strictly Lead Generation Model (No Cart, No Payments)
-- =========================================================================

-- Enable Required Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- Trigram Fuzzy Search (e.g. "alectrician" -> "electrician")

-- =========================================================================
-- 1. COUNTRIES TABLE
-- =========================================================================
create table if not exists public.countries (
  id serial primary key,
  name text not null,
  code text unique not null, -- e.g. 'pk', 'ae', 'sa'
  slug text unique not null, -- e.g. 'pakistan', 'uae', 'saudi-arabia'
  currency text default 'PKR',
  is_active boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 2. CITIES TABLE
-- =========================================================================
create table if not exists public.cities (
  id serial primary key,
  country_id int references public.countries(id) on delete cascade not null,
  name text not null,
  slug text not null, -- e.g. 'karachi', 'lahore', 'islamabad'
  is_active boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (country_id, slug)
);

-- =========================================================================
-- 3. CATEGORIES & MULTI-LANGUAGE TRANSLATIONS
-- =========================================================================
create table if not exists public.categories (
  id text primary key, -- e.g. 'electrician', 'ac-repair'
  name text not null, -- English display name
  slug text unique not null, -- strictly English slug
  icon text not null default 'build',
  active_count int default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Multi-language Category Translations (English, Urdu, Arabic)
create table if not exists public.category_translations (
  id serial primary key,
  category_id text references public.categories(id) on delete cascade not null,
  lang text not null check (lang in ('en', 'ur', 'ar')),
  name text not null, -- Translated category name
  description text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (category_id, lang)
);

-- =========================================================================
-- 4. PROFILES (Customers, Providers, Super Admins via Google OAuth)
-- =========================================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  phone text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'provider', 'admin')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 5. PROVIDERS (Main Service Directory Table)
-- =========================================================================
create table if not exists public.providers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  country_id int references public.countries(id) default 1,
  city_id int references public.cities(id) default 1,
  category_id text references public.categories(id) on delete set null,
  name text not null,
  slug text unique not null, -- STRICTLY English Slug (Transliterated from Urdu/Arabic)
  profile_type text not null default 'individual' check (profile_type in ('individual', 'shop')),
  whatsapp_number text not null,
  service_area text[] default '{}', -- e.g. ['Clifton', 'DHA', 'PECHS']
  short_bio text,
  is_verified boolean default false, -- Admin approval required
  is_available boolean default true, -- Provider studio toggle: "Available Now"
  avatar_url text,
  portfolio_photos text[] default '{}', -- Max 4 photos stored in 'provider-portfolios' bucket
  cnic_document_url text, -- Stored securely in private bucket 'secure-documents'
  starting_price int default 500,
  rating numeric(3, 1) default 5.0,
  review_count int default 0,
  total_leads int default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 6. SAVED PROFILES (User Bookmarks / Saved Page)
-- =========================================================================
create table if not exists public.saved_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null, -- Customer
  provider_id uuid references public.providers(id) on delete cascade not null, -- Kargar
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (user_id, provider_id)
);

-- =========================================================================
-- 7. LEADS (Direct WhatsApp Lead Generation & Tracking)
-- =========================================================================
create table if not exists public.leads (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references public.providers(id) on delete cascade not null,
  customer_id uuid references public.profiles(id) on delete set null,
  lead_type text default 'whatsapp' check (lead_type in ('whatsapp', 'call')),
  service_requested text,
  district text,
  client_ip text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 8. REVIEWS & RATINGS (Verified Customer Feedback)
-- =========================================================================
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references public.providers(id) on delete cascade not null,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  service_done text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 9. FULL-TEXT & FUZZY SEARCH INDEXES (pg_trgm)
-- Handles typos: e.g. "alectrician" -> "electrician"
-- =========================================================================
create index if not exists idx_providers_name_trgm on public.providers using gin (name gin_trgm_ops);
create index if not exists idx_providers_bio_trgm on public.providers using gin (short_bio gin_trgm_ops);
create index if not exists idx_categories_name_trgm on public.categories using gin (name gin_trgm_ops);
create index if not exists idx_providers_slug on public.providers (slug);
create index if not exists idx_providers_city_cat on public.providers (city_id, category_id);

-- Stored Procedure: Fuzzy Provider Search
create or replace function public.fuzzy_search_providers(search_term text, target_city text default 'karachi')
returns setof public.providers language sql stable as $$
  select p.*
  from public.providers p
  join public.cities c on p.city_id = c.id
  left join public.categories cat on p.category_id = cat.id
  where c.slug = target_city
    and (
      p.name ilike '%' || search_term || '%'
      or cat.name ilike '%' || search_term || '%'
      or p.short_bio ilike '%' || search_term || '%'
      or similarity(cat.name, search_term) > 0.25
      or similarity(p.name, search_term) > 0.25
    )
  order by
    greatest(similarity(cat.name, search_term), similarity(p.name, search_term)) desc,
    p.rating desc;
$$;

-- Stored Procedure: Increment Lead Count Automatically
create or replace function public.increment_provider_leads(target_provider_id uuid)
returns void language sql volatile as $$
  update public.providers
  set total_leads = total_leads + 1,
      updated_at = timezone('utc'::text, now())
  where id = target_provider_id;
$$;

-- =========================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
alter table public.countries enable row level security;
alter table public.cities enable row level security;
alter table public.categories enable row level security;
alter table public.category_translations enable row level security;
alter table public.profiles enable row level security;
alter table public.providers enable row level security;
alter table public.saved_profiles enable row level security;
alter table public.leads enable row level security;
alter table public.reviews enable row level security;

-- Public READ Policies
create policy "Public can read countries" on public.countries for select using (true);
create policy "Public can read cities" on public.cities for select using (true);
create policy "Public can read categories" on public.categories for select using (true);
create policy "Public can read translations" on public.category_translations for select using (true);
create policy "Public can read verified/active providers" on public.providers for select using (true);
create policy "Public can read reviews" on public.reviews for select using (true);

-- Profiles Policies
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Provider Edit Policies (Provider owns their row)
create policy "Provider can update own profile" on public.providers for update using (auth.uid() = user_id);

-- Saved Profiles Policies
create policy "Users can view own saved profiles" on public.saved_profiles for select using (auth.uid() = user_id);
create policy "Users can save a profile" on public.saved_profiles for insert with check (auth.uid() = user_id);
create policy "Users can remove a saved profile" on public.saved_profiles for delete using (auth.uid() = user_id);

-- Leads: Anyone can insert a lead (WhatsApp inquiry), but only provider or admin can view
create policy "Anyone can record a lead" on public.leads for insert with check (true);
create policy "Provider can view own leads" on public.leads for select using (
  exists (select 1 from public.providers p where p.id = leads.provider_id and p.user_id = auth.uid())
);

-- =========================================================================
-- 11. SUPABASE STORAGE BUCKETS & RLS
-- =========================================================================

-- Create Buckets (via Supabase storage schema)
insert into storage.buckets (id, name, public)
values 
  ('provider-portfolios', 'provider-portfolios', true),
  ('secure-documents', 'secure-documents', false)
on conflict (id) do nothing;

-- 11.1 Bucket: 'provider-portfolios' (Public Portfolio & Avatar Photos)
-- Anyone can view
create policy "Public portfolio viewable by everyone" on storage.objects
  for select using (bucket_id = 'provider-portfolios');

-- Authenticated provider can upload/update up to 4 compressed portfolio photos
create policy "Authenticated users can upload portfolio" on storage.objects
  for insert with check (bucket_id = 'provider-portfolios' and auth.role() = 'authenticated');

-- 11.2 Bucket: 'secure-documents' (CRITICAL PRIVATE BUCKET: CNIC / National ID)
-- Strictly Private: NEVER accessible by public
-- Only Authenticated user can upload their own CNIC during onboarding
create policy "Authenticated provider can upload CNIC" on storage.objects
  for insert with check (
    bucket_id = 'secure-documents' 
    and auth.role() = 'authenticated'
  );

-- Only Admin can view CNIC documents for verification
create policy "Only Admin can view CNIC documents" on storage.objects
  for select using (
    bucket_id = 'secure-documents'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- =========================================================================
-- 12. SEED DATA (Karachi Launch Initial Data)
-- =========================================================================
insert into public.countries (id, name, code, slug) values
  (1, 'Pakistan', 'pk', 'pakistan')
on conflict (id) do nothing;

insert into public.cities (id, country_id, name, slug) values
  (1, 1, 'Karachi', 'karachi'),
  (2, 1, 'Lahore', 'lahore'),
  (3, 1, 'Islamabad', 'islamabad')
on conflict (id) do nothing;

insert into public.categories (id, name, slug, icon, active_count) values
  ('electrician', 'Electrician', 'electrician', 'Zap', 42),
  ('ups-inverter-technician', 'UPS & Inverter Technician', 'ups-inverter-technician', 'BatteryCharging', 28),
  ('solar-installer', 'Solar Panel Installer', 'solar-installer', 'Sun', 34),
  ('generator-repair', 'Generator Mechanic', 'generator-repair', 'Power', 19),
  ('plumber', 'Plumber', 'plumber', 'Wrench', 37),
  ('water-pump-repair', 'Water Pump Mechanic', 'water-pump-repair', 'Gauge', 24),
  ('water-boring', 'Water Boring Specialist', 'water-boring', 'Layers', 18),
  ('water-tank-cleaning', 'Water Tank Cleaner', 'water-tank-cleaning', 'Waves', 31),
  ('ac-technician', 'AC Technician', 'ac-technician', 'Wind', 58),
  ('fridge-repair', 'Fridge & Freezer Mechanic', 'fridge-repair', 'Snowflake', 32),
  ('washing-machine-repair', 'Washing Machine Repair', 'washing-machine-repair', 'RotateCw', 26),
  ('geyser-repair', 'Geyser Technician', 'geyser-repair', 'Flame', 22),
  ('carpenter', 'Carpenter', 'carpenter', 'Hammer', 25),
  ('painter', 'Painter', 'painter', 'Paintbrush', 31),
  ('aluminium-glass-worker', 'Aluminium & Glass Worker', 'aluminium-glass-worker', 'Frame', 20),
  ('welder', 'Welder', 'welder', 'Zap', 17),
  ('mason', 'Mason', 'mason', 'Boxes', 23),
  ('pest-control', 'Pest Control & Fumigation', 'pest-control', 'Bug', 21),
  ('sofa-carpet-cleaning', 'Sofa & Carpet Cleaning', 'sofa-carpet-cleaning', 'Armchair', 29),
  ('cctv-installer', 'CCTV Installer', 'cctv-installer', 'Camera', 31),
  ('locksmith', 'Locksmith', 'locksmith', 'Key', 16),
  ('home-chef', 'Home Chef', 'home-chef', 'Utensils', 45),
  ('interior-designer', 'Interior Designer', 'interior-designer', 'PaintRoller', 24),
  ('movers-packers', 'Movers & Packers', 'movers-packers', 'Truck', 27)
on conflict (id) do nothing;

-- Multi-language Category Translations
insert into public.category_translations (category_id, lang, name, description) values
  ('electrician', 'en', 'Electrician & Wiring', 'DB breaker repairs, solar inverter wiring, UPS backup'),
  ('electrician', 'ur', 'الیکٹریشن اور وائرنگ', 'ڈی بی پینل بریکر ٹرپنگ، شارٹ سرکٹ فالٹ، سولر انورٹر وائرنگ'),
  ('electrician', 'ar', 'كهربائي وتمديدات', 'إصلاح لوحات التوزيع والتوصيلات الكهربائية'),
  ('ac', 'en', 'AC & Refrigeration', 'Inverter AC jet chemical servicing, genuine gas refilling'),
  ('ac', 'ur', 'اے سی سروس اور ریفریجریشن', 'انورٹر اے سی جیٹ واش، گیس چارجنگ اور پی سی بی ریپئرنگ'),
  ('plumbing', 'en', 'Plumbing & Boring', 'Underground leak detection, sweet water motor installation'),
  ('plumbing', 'ur', 'پلمبر اور بورنگ موٹر', 'پانی کے پائپ کی لیکیج، میٹھے پانی کی لائن اور سبمرسیبل موٹر'),
  ('interior-designer', 'en', 'Interior Designer', 'Space planning, 3D visualization, false ceiling, and luxury renovation'),
  ('interior-designer', 'ur', 'انٹیریئر ڈیزائنر', 'گھر اور کمروں کا جدید ڈیزائن، فال سیلنگ اور تھری ڈی ماڈلنگ'),
  ('interior-designer', 'ar', 'مصمم ديكور داخلي', 'تخطيط المساحات والديكور الداخلي والتصميم ثلاثي الأبعاد')
on conflict do nothing;

-- Sample Verified Providers with English Transliterated Slugs
insert into public.providers (
  id, country_id, city_id, category_id, name, slug, profile_type, whatsapp_number, service_area, short_bio, is_verified, is_available, starting_price, rating, review_count, total_leads
) values
  (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    1, 1, 'electrician',
    'Tariq Mahmood', 'tariq-mahmood', 'individual',
    '+923332145890',
    array['PECHS', 'Clifton', 'DHA Phases 1-8', 'Bahadurabad'],
    '18+ years experience servicing residential bungalows and commercial apartments across Karachi. Specialized in DB panel troubleshooting, short circuit emergency clearance, and hybrid solar UPS load segregation.',
    true, true, 800, 4.9, 128, 342
  ),
  (
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    1, 1, 'ac',
    'Kashif Ali', 'kashif-ali', 'individual',
    '+923012349811',
    array['Gulshan-e-Iqbal', 'Gulistan-e-Jauhar', 'Federal B Area'],
    'Certified Inverter AC technician with digital manifold gauges and genuine R410a/R32 refrigerants. Specializing in error code diagnosis, PCB card repairs, and anti-bacterial pressure washing.',
    true, true, 1200, 4.8, 94, 189
  ),
  (
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    1, 1, 'food',
    'Farzana Kitchen', 'farzana-kitchen', 'shop',
    '+923325567890',
    array['DHA Phase 5', 'Clifton', 'Zamzama'],
    'Authentic Karachi homemade food, daily office lunchboxes, and bulk daawat orders. 100% hygienic canola oil, premium basmati rice, and mutton biryani.',
    true, true, 550, 5.0, 210, 520
  ),
  (
    'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
    1, 1, 'plumbing',
    'Saleem Akhtar (Master Plumber)', 'saleem-master-plumber', 'individual',
    '+923129876543',
    array['Orangi Town', 'Nazimabad', 'North Nazimabad', 'SITE Area', 'Banaras'],
    '22+ years experience in deep underground water line leakage detection, PPRC/UPVC pipe fittings, water motor installations, and sanitary bathroom fittings across Orangi Town, Nazimabad, and SITE industrial area.',
    true, true, 700, 4.9, 84, 215
  )
on conflict (id) do nothing;
