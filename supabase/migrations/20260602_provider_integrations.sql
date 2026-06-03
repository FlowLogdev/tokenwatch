-- Provider integrations for importing external AI usage/cost data.
-- Safe to run more than once.

create table if not exists provider_integrations (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  provider text not null check (provider in ('openai', 'anthropic', 'github_copilot')),
  display_name text not null,
  encrypted_secret text not null,
  config jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'paused', 'error')),
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, provider, display_name)
);

create table if not exists provider_sync_runs (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  integration_id uuid not null references provider_integrations(id) on delete cascade,
  provider text not null,
  status text not null default 'running' check (status in ('running', 'succeeded', 'failed')),
  imported_events integer not null default 0,
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists provider_integrations_org_idx on provider_integrations(org_id);
create index if not exists provider_integrations_status_idx on provider_integrations(status);
create index if not exists provider_sync_runs_integration_idx on provider_sync_runs(integration_id, started_at);

alter table provider_integrations enable row level security;
alter table provider_sync_runs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'provider_integrations'
      and policyname = 'org members can view provider integrations'
  ) then
    create policy "org members can view provider integrations" on provider_integrations
      for select using (org_id = get_org_id() or is_global_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'provider_integrations'
      and policyname = 'org admins can insert provider integrations'
  ) then
    create policy "org admins can insert provider integrations" on provider_integrations
      for insert with check (org_id = get_org_id() or is_global_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'provider_integrations'
      and policyname = 'org admins can update provider integrations'
  ) then
    create policy "org admins can update provider integrations" on provider_integrations
      for update using (org_id = get_org_id() or is_global_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'provider_integrations'
      and policyname = 'org admins can delete provider integrations'
  ) then
    create policy "org admins can delete provider integrations" on provider_integrations
      for delete using (org_id = get_org_id() or is_global_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'provider_sync_runs'
      and policyname = 'org members can view provider sync runs'
  ) then
    create policy "org members can view provider sync runs" on provider_sync_runs
      for select using (org_id = get_org_id() or is_global_admin());
  end if;
end $$;
