-- TokenWatch Database Schema
-- Run in Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Organizations (multi-tenant)
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  plan text not null default 'starter' check (plan in ('starter', 'team', 'enterprise')),
  monthly_budget integer not null default 200000, -- cents, default $2000
  stripe_customer_id text,
  stripe_subscription_id text,
  slack_webhook_url text,
  alert_config jsonb,
  created_at timestamptz not null default now()
);

-- Users (linked to Supabase auth)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  email text not null,
  name text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Engineers (tracked engineers, may not have accounts)
create table engineers (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text not null,
  team text,
  monthly_budget_override integer, -- cents, overrides org default
  created_at timestamptz not null default now(),
  unique (org_id, email)
);

-- Usage Events (core data)
create table usage_events (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  engineer_id uuid not null references engineers(id) on delete cascade,
  tool text not null,
  model text not null default 'unknown',
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd integer not null default 0, -- cents
  session_id text,
  metadata jsonb,
  timestamp timestamptz not null default now()
);

create index usage_events_org_id_idx on usage_events(org_id);
create index usage_events_engineer_id_idx on usage_events(engineer_id);
create index usage_events_timestamp_idx on usage_events(timestamp);
create index usage_events_org_timestamp_idx on usage_events(org_id, timestamp);

-- Daily Summaries (materialized for perf)
create table daily_summaries (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  engineer_id uuid not null references engineers(id) on delete cascade,
  tool text not null,
  date date not null,
  total_tokens integer not null default 0,
  total_cost_usd integer not null default 0, -- cents
  session_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (org_id, engineer_id, tool, date)
);

create index daily_summaries_org_date_idx on daily_summaries(org_id, date);
create index daily_summaries_engineer_date_idx on daily_summaries(engineer_id, date);

-- Budget Alerts
create table budget_alerts (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  engineer_id uuid not null references engineers(id) on delete cascade,
  threshold_pct integer not null, -- 50, 80, 100 or -1 for anomaly
  triggered_at timestamptz not null default now(),
  notified_at timestamptz,
  spend_at_trigger integer not null default 0 -- cents
);

create index budget_alerts_org_idx on budget_alerts(org_id);
create index budget_alerts_engineer_triggered_idx on budget_alerts(engineer_id, triggered_at);

-- API Keys
create table api_keys (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  key_hash text not null unique,
  name text not null default 'Default',
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

-- =====================
-- Row Level Security
-- =====================

alter table organizations enable row level security;
alter table users enable row level security;
alter table engineers enable row level security;
alter table usage_events enable row level security;
alter table daily_summaries enable row level security;
alter table budget_alerts enable row level security;
alter table api_keys enable row level security;

-- Helper function: get current user's org_id
create or replace function get_org_id()
returns uuid
language sql
security definer
as $$
  select org_id from users where id = auth.uid()
$$;

-- Organizations: members can see their own org
create policy "org members can view their org" on organizations
  for select using (id = get_org_id());

create policy "org admins can update their org" on organizations
  for update using (id = get_org_id());

-- Users: can see users in same org
create policy "users can view org members" on users
  for select using (org_id = get_org_id());

create policy "users can update own profile" on users
  for update using (id = auth.uid());

-- Engineers: org members can manage
create policy "org members can view engineers" on engineers
  for select using (org_id = get_org_id());

create policy "org admins can insert engineers" on engineers
  for insert with check (org_id = get_org_id());

create policy "org admins can update engineers" on engineers
  for update using (org_id = get_org_id());

-- Usage events: org members can view their org's data
create policy "org members can view usage events" on usage_events
  for select using (org_id = get_org_id());

-- Daily summaries
create policy "org members can view daily summaries" on daily_summaries
  for select using (org_id = get_org_id());

-- Budget alerts
create policy "org members can view budget alerts" on budget_alerts
  for select using (org_id = get_org_id());

-- API keys
create policy "org members can view api keys" on api_keys
  for select using (org_id = get_org_id());

-- Service role can do anything (used by API routes + cron)
-- The service role key bypasses RLS by default in Supabase

-- =====================
-- Auth trigger: auto-create user + org on signup
-- =====================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  new_org_id uuid;
  org_name text;
  org_slug text;
begin
  -- Get org name from user metadata
  org_name := coalesce(new.raw_user_meta_data->>'org_name', 'My Organization');
  org_slug := lower(regexp_replace(org_name, '[^a-z0-9]+', '-', 'g'));

  -- Create organization
  insert into organizations (name, slug)
  values (org_name, org_slug || '-' || substr(new.id::text, 1, 8))
  returning id into new_org_id;

  -- Create user record
  insert into users (id, org_id, email, name, role)
  values (
    new.id,
    new_org_id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    'admin'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
