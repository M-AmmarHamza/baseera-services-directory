-- =========================================================================
-- BASEERA KARACHI - DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- Design System: Karachi Directory Minimal
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Customers, Providers, Admins linked to Google Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  phone text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'provider', 'admin')),
  district text default 'Karachi (All)',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CATEGORIES (Local Trade Specialties)
create table if not exists public.categories (
  id text primary key,
  slug text unique not null,
  name text not null,
  icon text not null,
  active_count int default 0,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PROVIDERS (Verified Karachi Technicians & Specialists)
create table if not exists public.providers (
  id text primary key,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  category_id text references public.categories(id) on delete set null,
  trade_title text not null,
  district text not null,
  coverage_areas text[] default '{}',
  address text,
  phone text not null,
  whatsapp_number text not null,
  avatar_url text,
  bio text,
  starting_price int default 500,
  max_price int default 3000,
  rating numeric(3, 1) default 5.0,
  review_count int default 0,
  is_available boolean default true,
  is_verified boolean default true,
  police_verified boolean default false,
  badge_text text default 'Verified Pro',
  photos text[] default '{}',
  services jsonb default '[]'::jsonb,
  total_leads int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. LEADS (Direct WhatsApp Leads & Call Inquiry Tracking)
create table if not exists public.leads (
  id uuid default uuid_generate_v4() primary key,
  provider_id text references public.providers(id) on delete cascade not null,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_phone text,
  lead_type text default 'whatsapp' check (lead_type in ('whatsapp', 'call', 'direct')),
  service_requested text,
  district text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. REVIEWS & RATINGS
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  provider_id text references public.providers(id) on delete cascade not null,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  service_done text,
  is_verified_job boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.providers enable row level security;
alter table public.leads enable row level security;
alter table public.reviews enable row level security;

-- Public can read profiles, categories, providers, reviews
create policy "Public categories are readable" on public.categories for select using (true);
create policy "Public providers are readable" on public.providers for select using (true);
create policy "Public reviews are readable" on public.reviews for select using (true);
create policy "Profiles readable by authenticated users" on public.profiles for select using (true);

-- Anyone can log a lead (WhatsApp click)
create policy "Leads can be logged by anyone" on public.leads for insert with check (true);

-- Authenticated providers can manage their own profile
create policy "Providers can update own data" on public.providers for update
  using (auth.uid() = user_id or auth.role() = 'service_role');

-- =========================================================================
-- SEED DATA: KARACHI SPECIALTIES & VERIFIED PROVIDERS
-- =========================================================================
insert into public.categories (id, slug, name, icon, active_count, description) values
  ('electrician', 'electrician', 'Electrician', 'bolt', 42, 'Master wiring, UPS & inverter installation, DB repairs'),
  ('plumber', 'plumber', 'Plumber', 'water_drop', 38, 'Underground tank leaks, sanitary fitting, booster pumps'),
  ('chef', 'chef', 'Home Chef', 'restaurant', 29, 'Hygienic daily tiffin, authentic Sindhi Biryani, event catering'),
  ('painter', 'painter', 'Painter', 'format_paint', 19, 'Interior emulsion, weatherproof exterior, damp seepage proofing'),
  ('ac', 'ac', 'AC Repair', 'air', 54, 'Inverter gas refilling, PCB repairs, master jet wash'),
  ('carpenter', 'carpenter', 'Carpenter', 'handyman', 25, 'Door polish, custom kitchen cabinets, lock repairs'),
  ('cleaning', 'cleaning', 'Cleaner', 'auto_awesome', 31, 'Water tank deep disinfection, post-monsoon sanitation'),
  ('appliances', 'appliances', 'Appliance', 'build', 40, 'Washing machines, microwave ovens, refrigerator compressors'),
  ('tailor', 'tailor', 'Tailor', 'content_cut', 22, 'Gents Shalwar Kameez, Ladies formal stitching, doorstep fitting')
on conflict (id) do nothing;

insert into public.providers (
  id, name, category_id, trade_title, district, coverage_areas, address, phone, whatsapp_number,
  avatar_url, bio, starting_price, max_price, rating, review_count, is_available, is_verified, police_verified, badge_text, photos, services
) values
(
  'tariq-electric',
  'Tariq Mahmood',
  'electrician',
  'Master Electrician & Wiring Specialist',
  'PECHS',
  array['PECHS', 'Clifton', 'DHA Phases 1-8', 'Bahadurabad', 'Saddar'],
  'Shop #4, Block 2, Commercial Area, PECHS, Karachi',
  '+923332145890',
  '+923332145890',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBK9qWTJzXQzuvOCxeaY9oaT5QnMSIE_WRvPrYq3ndOxqfGwgRJiuusiLQI6ptKnL9aXydagk97uFwsxC7j-gxTH2VH5N_HAJpsT3T0CG_IE0OBqsRNY1C_6XY0VC8sNDh1YBotW-weRk3E7XwleN6ZT1cvkRynmWL_e-anI_it8xQNPs3oqJRRO7Xrk7PfW-P6i2RwcClJxEboVmdY8ZF6bL0HcCJgGu5qW0x9sje5DlC6qn7x4H7V',
  '18+ years experience servicing residential bungalows and commercial apartments across Karachi South & East. Specialized in DB panel troubleshooting, short circuit emergency clearance, and hybrid solar UPS load segregation.',
  800, 4500, 4.9, 128, true, true, true, 'Verified Pro',
  array[
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDh_sRw3hmV3-7S4eNUd-jVO6bSyp0hVjmvJnXG1oQgcAzN4VP_eIJmZkl_MPu4cn6bdK2L8vqRh-o3t5WJiZO5TxWY_sqrtZ3IEN0Z--_cgbhxjNDSjvWO-GU0eiTs0MbgHl_RKimCrBYqcVeAFD5itfUXN0BPc3h_RqJ7QxAG6T4a8tmK_zj2jjST6iDrmQLd7bRv5r8IvN6HyGLW7O7OZgikD5SLl5PGm5qg8hoKu1pyQ2C9_2vX',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC2l4P0wqkni4JXap4ad5Xf4HBbfy1jyDHX3FUdMUrFo0396vlt_xfNg48P99hWFZE-TfWOW8xbOZ9wTZBmkBIz6h6b3dlmcr_B_dxRSiddrF71x29Ia7h2L7mo-1vBv2CzpQwSr_h5VXoM-AFpvpuUudH-fkzbk01Jf_tEy8wB3_C_mYqB23LbrEJlKaJ_qIeVMnySPeESilDDoyKX3XwKFzWuhJSG2QGH2NRvAqye0WBFQ9LEBL63'
  ],
  '[
    {"name": "Standard Inspection & Diagnosis", "price": "Rs. 800", "desc": "On-site electrical testing, load calculation, and safety check."},
    {"name": "Main DB Breaker / Circuit Board Repair", "price": "Rs. 1,500 - 3,500", "desc": "Replacing damaged trip breakers, contactors, and busbar cleaning."},
    {"name": "UPS & Inverter Home Wiring Integration", "price": "Rs. 2,000 - 4,500", "desc": "Separate line rewiring, battery water top-up, and cut-off calibration."}
  ]'::jsonb
),
(
  'karachi-cooling-expert',
  'Kashif Ali',
  'ac',
  'AC & Refrigeration Specialist',
  'Gulshan-e-Iqbal',
  array['Gulshan-e-Iqbal', 'Gulistan-e-Jauhar', 'Federal B Area', 'North Nazimabad'],
  'Block 6, Gulshan-e-Iqbal, Near Disco Bakery, Karachi',
  '+923012349811',
  '+923012349811',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDrVEOf4Kmm3ZmFg2SVyQFHc7CD8jvopigKY9y06BL7csj1WLTVWDmQqVt9BLA-VImJWY1FnjTlOTMBdLORMVFgTEdwQKPPqGcSnJWhS5AriQLENY6vHirxqBOzQHMWyqZjRyr6tgRG-1ieePqu9nM2GIZj-GUmMil3H8fWsOahBKbVJj1EXc7oGAdad_P_Cb1e1CbAKo9FYlkkU-0dpz0biB1i9POZASr1lFg6dTIGFODNEO_8u9eb',
  'Certified Inverter AC technician with digital manifold gauges and genuine R410a/R32 refrigerants. Specializing in error code diagnosis, PCB card repairs, and anti-bacterial pressure washing.',
  1200, 6000, 4.8, 94, true, true, false, 'Quick Reply',
  array[
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAwJSSeqkBEs912dPToIw5ZwJADc2DL58s3Vkdx5CAGD1CrSl0pte2ksPOtF5VJHpFxLvy_ooyoPIiCnKZm3GQAb4iwf7p8s390q4lN_r3ElrFaZcAh3X5JVGg1DGIwVfEXzNeHHLdM89YSLzV8QEAO4ujqocOLdmYpHo0SST3HtqOtmrJPLITM1GAb1ay-CHOZOtjpdD13H3HinPwlmuXp-aqVaVFezYaH8Xjsl3OPcbyVg5nP5k3B'
  ],
  '[
    {"name": "Complete Jet Pressure Chemical Service", "price": "Rs. 1,500", "desc": "Indoor blower removal, outdoor condenser pressure washing."},
    {"name": "Genuine Inverter Gas Charging (R410A / R32)", "price": "Rs. 3,500 - 5,500", "desc": "Nitrogen leak testing, vacuum pull, and precision digital gas filling."}
  ]'::jsonb
),
(
  'dha-home-chef-fatima',
  'Farzana Kitchen',
  'chef',
  'Authentic Home Cook & Daawat Specialist',
  'DHA & Clifton',
  array['DHA Phases 1-8', 'Clifton', 'Bath Island'],
  'Phase 5, DHA, Karachi',
  '+923325567890',
  '+923325567890',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBZZ3jFfYAUp1f6ZwaA3bw9DUYqcbD067tf2DiX2SWLVRwTUhafGFCOzOzsUTICpmDPFe91mBv1GRm3r-qyUJZbnBeN57VtXsCuKHMVsXx1aioXkyo3Sw6_yQg78DkkPYzj3soUYY7YS49NK-hbHVquzL-bkNCxoWMINuv2OS5c5kG0a8JFOI5irxZcGHL_fDVrQ4YMj7ltf8FV7Xr-DHs1rDSBoxy0sTlo2SIaOGOn_DXV-DBQ1RiE',
  'Pure hygienic home cooking prepared with premium branded spices and filtered water. Supplying daily executive lunch tiffins and weekend family dinner daawat platters.',
  650, 4500, 5.0, 210, true, true, true, 'Top Rated',
  array[],
  '[
    {"name": "Daily Executive Single Tiffin", "price": "Rs. 650", "desc": "1 Salan (Chicken/Sabzi/Daal), 2 Roti, Raita & Fresh Salad."},
    {"name": "Special Weekend Sindhi Biryani Deg (5kg)", "price": "Rs. 4,200", "desc": "Long grain basmati rice with succulent potatoes and farm chicken."}
  ]'::jsonb
)
on conflict (id) do nothing;
