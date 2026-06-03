-- ============================================================
-- QuoteFlow AI — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- QUOTES TABLE
create table if not exists public.quotes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  quote_number text not null,
  customer_name  text not null,
  customer_email text not null default '',
  customer_phone text not null default '',
  items       jsonb not null default '[]',
  subtotal    numeric(12,2) not null default 0,
  gst         numeric(12,2) not null default 0,
  grand_total numeric(12,2) not null default 0,
  status      text not null default 'Draft',
  created_at  timestamptz not null default now()
);

alter table public.quotes enable row level security;

create policy "Users can manage their own quotes"
  on public.quotes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- CUSTOMERS TABLE
create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null default '',
  phone       text not null default '',
  total_quotes integer not null default 0,
  created_at  timestamptz not null default now(),
  unique (user_id, email)
);

alter table public.customers enable row level security;

create policy "Users can manage their own customers"
  on public.customers
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- SETTINGS TABLE
create table if not exists public.settings (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references auth.users(id) on delete cascade,
  company_name  text not null default '',
  company_email text not null default '',
  company_phone text not null default '',
  gst_number    text not null default '',
  address       text not null default '',
  logo_base64   text not null default '',
  updated_at    timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "Users can manage their own settings"
  on public.settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
