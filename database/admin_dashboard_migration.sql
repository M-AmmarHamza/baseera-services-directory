-- =========================================================================
-- BASEERA DIRECTORY: ADMIN DASHBOARD & MODERATION SCHEMA MIGRATION
-- Enhances providers table with Status moderation and Featured flags
-- =========================================================================

-- 1. Add status and is_featured to providers table
alter table if exists public.providers 
  add column if not exists status text default 'pending' 
  check (status in ('pending', 'approved', 'rejected', 'suspended'));

-- Ensure default for all future registrations is strictly 'pending'
alter table if exists public.providers 
  alter column status set default 'pending';

alter table if exists public.providers 
  add column if not exists is_featured boolean default false;

-- 2. Performance indexes for Moderation queries
create index if not exists idx_providers_status on public.providers (status);
create index if not exists idx_providers_is_featured on public.providers (is_featured);

-- 3. Backfill existing providers:
-- If is_verified is true, set status = 'approved'; otherwise 'pending'
update public.providers 
set status = case 
  when is_verified = true then 'approved' 
  else 'pending' 
end
where status is null;

-- 4. Admin Users & Roles table (optional Supabase auth integration)
create table if not exists public.admin_users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  role text default 'admin' check (role in ('admin', 'moderator', 'editor')),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table public.admin_users enable row level security;

create policy "Admins can view admin_users"
  on public.admin_users for select
  using (true);

-- Seed default administrator
insert into public.admin_users (email, role)
values ('admin@baseera.com', 'admin')
on conflict (email) do nothing;
