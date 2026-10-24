-- GrowFund schema
create extension if not exists "uuid-ossp";

create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  tagline text not null,
  story text not null,
  use_of_funds jsonb not null default '[]',
  terms jsonb not null default '{}',
  faqs jsonb not null default '[]',
  offer_document text not null,
  risk_summary jsonb not null default '[]',
  category text not null default 'Cafe',
  city text not null default 'Pune',
  goal numeric(12,2) not null default 0,
  raised numeric(12,2) not null default 0,
  min_ticket numeric(10,2) not null default 10000,
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists investments (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade not null,
  investor_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(10,2) not null,
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_campaigns_owner on campaigns(owner_id);
create index if not exists idx_campaigns_status on campaigns(status);
create index if not exists idx_investments_campaign on investments(campaign_id);
create index if not exists idx_investments_investor on investments(investor_id);
create index if not exists idx_notifications_user on notifications(user_id, created_at desc);

alter table campaigns enable row level security;
alter table investments enable row level security;
alter table notifications enable row level security;

create policy "campaigns_public_read" on campaigns for select using (status = 'published');
create policy "campaigns_owner_all" on campaigns for all using (auth.uid() = owner_id);
create policy "investments_investor_read" on investments for select using (auth.uid() = investor_id);
create policy "investments_owner_read" on investments for select using (
  exists (select 1 from campaigns c where c.id = campaign_id and c.owner_id = auth.uid())
);
create policy "notifications_user_read" on notifications for select using (auth.uid() = user_id);
create policy "notifications_user_update" on notifications for update using (auth.uid() = user_id);