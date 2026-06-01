-- ============================================================================
-- Sapphire Auto Hub — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`) to provision the
-- backend, then set DATA_SOURCE=supabase and the Supabase env vars.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Vehicles
-- ---------------------------------------------------------------------------
create table if not exists vehicles (
  id                   uuid primary key default uuid_generate_v4(),
  type                 varchar(10) not null check (type in ('car', 'bike')),
  make                 varchar(50) not null,
  model                varchar(50) not null,
  variant              varchar(80),
  year                 integer not null,
  price                numeric(12, 2) not null,
  kms_driven           integer not null,
  owners               integer not null default 1,
  fuel_type            varchar(20),   -- cars (and hybrids)
  transmission         varchar(20),   -- cars
  engine_cc            integer,       -- bikes
  mileage              numeric(6, 2),
  color                varchar(50),
  body_type            varchar(40),
  registration_number  varchar(30),
  registration_city    varchar(60),
  insurance_valid_till date,
  description          text,
  images               text[] not null default '{}',
  primary_image_url    text not null,
  is_sold              boolean not null default false,
  is_featured          boolean not null default false,
  views                integer not null default 0,
  created_at           timestamptz not null default timezone('utc', now())
);

create index if not exists vehicles_type_idx       on vehicles (type);
create index if not exists vehicles_is_sold_idx     on vehicles (is_sold);
create index if not exists vehicles_created_at_idx  on vehicles (created_at desc);

-- ---------------------------------------------------------------------------
-- Leads
-- ---------------------------------------------------------------------------
create table if not exists leads (
  id             uuid primary key default uuid_generate_v4(),
  vehicle_id     uuid references vehicles(id) on delete cascade,
  customer_name  varchar(100) not null,
  customer_phone varchar(20) not null,
  status         varchar(15) not null default 'new'
                   check (status in ('new', 'contacted', 'closed')),
  created_at     timestamptz not null default timezone('utc', now())
);

create index if not exists leads_vehicle_id_idx on leads (vehicle_id);
create index if not exists leads_created_at_idx on leads (created_at desc);

-- Atomic view counter used by the detail page.
create or replace function increment_vehicle_views(vehicle uuid)
returns void language sql as $$
  update vehicles set views = views + 1 where id = vehicle;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public can: read active inventory, create a lead (enquiry).
-- Authenticated admin can: do everything.
-- (Privileged writes from the app use the service-role key, which bypasses RLS.)
-- ---------------------------------------------------------------------------
alter table vehicles enable row level security;
alter table leads enable row level security;

drop policy if exists "Public reads vehicles" on vehicles;
create policy "Public reads vehicles"
  on vehicles for select using (true);

drop policy if exists "Admin writes vehicles" on vehicles;
create policy "Admin writes vehicles"
  on vehicles for all to authenticated using (true) with check (true);

drop policy if exists "Public creates leads" on leads;
create policy "Public creates leads"
  on leads for insert with check (true);

drop policy if exists "Admin reads/updates leads" on leads;
create policy "Admin reads/updates leads"
  on leads for all to authenticated using (true) with check (true);
