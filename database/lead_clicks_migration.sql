-- =========================================================================
-- BASEERA DIRECTORY: LEAD CLICK TRACKING SCHEMA MIGRATION
-- Records outbound leads (WhatsApp, Direct Phone Call, Telegram)
-- Architecture: Strictly Lead Generation Model (No Cart, No Payments)
-- =========================================================================

-- Enable uuid generator extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. Create lead_clicks table
create table if not exists public.lead_clicks (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references public.providers(id) on delete cascade,
  category_id text,
  city_id text,
  click_type text check (click_type in ('whatsapp', 'call', 'telegram', 'email')) not null default 'whatsapp',
  client_ip text,
  user_agent text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. Performance Indexes for Analytics & Dashboard Queries
create index if not exists idx_lead_clicks_provider_id on public.lead_clicks (provider_id);
create index if not exists idx_lead_clicks_category_id on public.lead_clicks (category_id);
create index if not exists idx_lead_clicks_city_id on public.lead_clicks (city_id);
create index if not exists idx_lead_clicks_created_at on public.lead_clicks (created_at desc);
create index if not exists idx_lead_clicks_type on public.lead_clicks (click_type);

-- 3. Row Level Security (RLS)
alter table public.lead_clicks enable row level security;

-- Policy: Allow anonymous / public visitors to record outbound lead clicks
create policy "Anyone can insert a lead click"
  on public.lead_clicks
  for insert
  with check (true);

-- Policy: Allow providers and directory administrators to read click analytics
create policy "Authenticated users can view lead clicks"
  on public.lead_clicks
  for select
  using (true);

-- 4. Stored Procedure: Increment Provider Total Leads on Outbound Click
create or replace function public.record_lead_and_increment(
  p_provider_id uuid,
  p_category_id text default null,
  p_city_id text default null,
  p_click_type text default 'whatsapp'
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_click_id uuid;
begin
  -- Insert the click record
  insert into public.lead_clicks (provider_id, category_id, city_id, click_type)
  values (p_provider_id, p_category_id, p_city_id, p_click_type)
  returning id into v_click_id;

  -- Increment the provider's total_leads counter if provider exists
  if p_provider_id is not null then
    update public.providers
    set total_leads = coalesce(total_leads, 0) + 1
    where id = p_provider_id;
  end if;

  return v_click_id;
end;
$$;
