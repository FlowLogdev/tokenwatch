-- TokenWatch approval, billing gate, and support ticket migration.
-- Safe to run more than once.

alter table if exists organizations
  add column if not exists approval_status text not null default 'pending',
  add column if not exists subscription_status text not null default 'unpaid';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_approval_status_check'
  ) then
    alter table organizations
      add constraint organizations_approval_status_check
      check (approval_status in ('pending', 'approved', 'denied'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'organizations_subscription_status_check'
  ) then
    alter table organizations
      add constraint organizations_subscription_status_check
      check (subscription_status in ('unpaid', 'active', 'past_due', 'canceled'));
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'users_role_check'
  ) then
    alter table users drop constraint users_role_check;
  end if;

  alter table users
    add constraint users_role_check
    check (role in ('global_admin', 'admin', 'member'));
end $$;

create table if not exists support_tickets (
  id uuid primary key default uuid_generate_v4(),
  ticket_number text not null unique,
  org_id uuid references organizations(id) on delete set null,
  user_id uuid references users(id) on delete set null,
  requester_name text not null,
  requester_email text not null,
  company text,
  subject text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  last_customer_read_at timestamptz,
  last_admin_read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists support_ticket_messages (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  author_user_id uuid references users(id) on delete set null,
  author_email text not null,
  author_name text not null,
  is_admin boolean not null default false,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists support_tickets_org_idx on support_tickets(org_id);
create index if not exists support_tickets_email_idx on support_tickets(requester_email);
create index if not exists support_tickets_status_idx on support_tickets(status);
create index if not exists support_ticket_messages_ticket_idx on support_ticket_messages(ticket_id, created_at);

alter table support_tickets enable row level security;
alter table support_ticket_messages enable row level security;

create or replace function is_global_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from users
    where id = auth.uid()
      and (role = 'global_admin' or lower(email) = 'support@flowlog.dev')
  )
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'support_tickets'
      and policyname = 'customers can view their tickets'
  ) then
    create policy "customers can view their tickets" on support_tickets
      for select using (org_id = get_org_id() or requester_email = auth.email() or is_global_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'support_ticket_messages'
      and policyname = 'customers can view ticket messages'
  ) then
    create policy "customers can view ticket messages" on support_ticket_messages
      for select using (
        exists (
          select 1 from support_tickets
          where support_tickets.id = support_ticket_messages.ticket_id
            and (support_tickets.org_id = get_org_id() or support_tickets.requester_email = auth.email() or is_global_admin())
        )
      );
  end if;
end $$;

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
  org_name := coalesce(new.raw_user_meta_data->>'org_name', 'My Organization');
  org_slug := lower(regexp_replace(org_name, '[^a-z0-9]+', '-', 'g'));

  if lower(new.email) = 'support@flowlog.dev' then
    insert into organizations (name, slug, approval_status, subscription_status, plan)
    values ('Flowlog Admin', 'flowlog-admin-' || substr(new.id::text, 1, 8), 'approved', 'active', 'enterprise')
    returning id into new_org_id;

    insert into users (id, org_id, email, name, role)
    values (
      new.id,
      new_org_id,
      new.email,
      coalesce(new.raw_user_meta_data->>'name', 'Flowlog Support'),
      'global_admin'
    );

    return new;
  end if;

  insert into organizations (name, slug, approval_status, subscription_status)
  values (org_name, org_slug || '-' || substr(new.id::text, 1, 8), 'pending', 'unpaid')
  returning id into new_org_id;

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
