-- Fixed AI tool subscriptions for monthly SaaS spend tracking.
-- Safe to run more than once.

create table if not exists tool_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  engineer_id uuid references engineers(id) on delete set null,
  tool text not null,
  plan_name text not null,
  monthly_cost_cents integer not null check (monthly_cost_cents >= 0),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'annual')),
  renewal_day integer check (renewal_day between 1 and 31),
  status text not null default 'active' check (status in ('active', 'paused', 'canceled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tool_subscriptions_org_idx on tool_subscriptions(org_id);
create index if not exists tool_subscriptions_engineer_idx on tool_subscriptions(engineer_id);
create index if not exists tool_subscriptions_status_idx on tool_subscriptions(status);

alter table tool_subscriptions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'tool_subscriptions'
      and policyname = 'org members can view tool subscriptions'
  ) then
    create policy "org members can view tool subscriptions" on tool_subscriptions
      for select using (org_id = get_org_id() or is_global_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'tool_subscriptions'
      and policyname = 'org admins can insert tool subscriptions'
  ) then
    create policy "org admins can insert tool subscriptions" on tool_subscriptions
      for insert with check (org_id = get_org_id() or is_global_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'tool_subscriptions'
      and policyname = 'org admins can update tool subscriptions'
  ) then
    create policy "org admins can update tool subscriptions" on tool_subscriptions
      for update using (org_id = get_org_id() or is_global_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'tool_subscriptions'
      and policyname = 'org admins can delete tool subscriptions'
  ) then
    create policy "org admins can delete tool subscriptions" on tool_subscriptions
      for delete using (org_id = get_org_id() or is_global_admin());
  end if;
end $$;
