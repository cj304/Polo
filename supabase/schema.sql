-- ─────────────────────────────────────────────────────────────
-- LeadCommand — Supabase schema
-- Run in the Supabase SQL editor (or `supabase db push`).
-- ─────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- Enums ------------------------------------------------------------
do $$ begin
  create type deal_type as enum ('sell', 'rent', 'jv');
exception when duplicate_object then null; end $$;

do $$ begin
  create type campaign_status as enum ('active', 'paused', 'for_sale');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum ('new', 'qualified', 'billed', 'invalid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ai_disposition as enum ('hot', 'warm', 'cold');
exception when duplicate_object then null; end $$;

do $$ begin
  create type revenue_type as enum ('lead_sale', 'monthly_rent', 'jv_payment');
exception when duplicate_object then null; end $$;

-- Clients ----------------------------------------------------------
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  business_name text not null,
  email text,
  phone text,
  deal_type deal_type not null default 'rent',
  contract_start date,
  contract_renewal date,
  stripe_customer_id text,
  notes text,
  created_at timestamptz not null default now()
);

-- Campaigns --------------------------------------------------------
create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  niche text not null,
  city text,
  state text,
  telnyx_number text,
  telnyx_assistant_id text,
  status campaign_status not null default 'active',
  deal_type deal_type not null default 'rent',
  client_id uuid references clients(id) on delete set null,
  monthly_value numeric(12,2) default 0,
  per_lead_rate numeric(12,2),
  jv_percentage numeric(5,2),
  created_at timestamptz not null default now()
);

-- Leads ------------------------------------------------------------
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  telnyx_call_id text unique,
  caller_number text,
  caller_name text,
  call_duration integer,                     -- seconds
  recording_url text,
  transcript text,
  ai_disposition ai_disposition,
  appointment_booked boolean not null default false,
  appointment_datetime timestamptz,
  status lead_status not null default 'new',
  answered_at timestamptz,
  created_at timestamptz not null default now()
);

-- Revenue ----------------------------------------------------------
create table if not exists revenue (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete set null,
  campaign_id uuid references campaigns(id) on delete set null,
  type revenue_type not null,
  amount numeric(12,2) not null,
  description text,
  stripe_invoice_id text,
  paid boolean not null default false,
  due_date date,
  paid_date date,
  created_at timestamptz not null default now()
);

-- Call routing -----------------------------------------------------
create table if not exists call_routing (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  forward_to_number text,
  backup_number text,
  business_hours_start text default '08:00',
  business_hours_end text default '18:00',
  after_hours_ai boolean not null default true,
  created_at timestamptz not null default now()
);

-- Indexes ----------------------------------------------------------
create index if not exists idx_leads_campaign on leads(campaign_id);
create index if not exists idx_leads_client on leads(client_id);
create index if not exists idx_leads_created on leads(created_at desc);
create index if not exists idx_campaigns_client on campaigns(client_id);
create index if not exists idx_revenue_client on revenue(client_id);
create index if not exists idx_revenue_campaign on revenue(campaign_id);

-- Row Level Security ----------------------------------------------
-- Enable RLS and add authenticated-user policies. Tighten per-tenant
-- as the org model is finalized.
alter table clients enable row level security;
alter table campaigns enable row level security;
alter table leads enable row level security;
alter table revenue enable row level security;
alter table call_routing enable row level security;

do $$
declare t text;
begin
  foreach t in array array['clients','campaigns','leads','revenue','call_routing'] loop
    execute format(
      'create policy if not exists "auth read %1$s" on %1$s for select using (auth.role() = ''authenticated'');', t);
    execute format(
      'create policy if not exists "auth write %1$s" on %1$s for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'');', t);
  end loop;
end $$;
