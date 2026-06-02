-- ============================================================================
-- Sapphire Auto Hub — Neon PostgreSQL schema
-- Run this once in the Neon SQL editor to provision all tables.
-- Then set DATA_SOURCE=neon and DATABASE_URL in your Vercel env vars.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Vehicles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type                 VARCHAR(10)  NOT NULL CHECK (type IN ('car', 'bike')),
  make                 VARCHAR(80)  NOT NULL,
  model                VARCHAR(80)  NOT NULL,
  variant              VARCHAR(100),
  year                 INTEGER      NOT NULL,
  price                NUMERIC(12,2) NOT NULL,
  kms_driven           INTEGER      NOT NULL,
  owners               INTEGER      NOT NULL DEFAULT 1,
  fuel_type            VARCHAR(20),
  transmission         VARCHAR(20),
  engine_cc            INTEGER,
  mileage              NUMERIC(6,2),
  color                VARCHAR(60),
  body_type            VARCHAR(50),
  registration_number  VARCHAR(30),
  registration_city    VARCHAR(80),
  insurance_valid_till DATE,
  description          TEXT,
  images               TEXT[]       NOT NULL DEFAULT '{}',
  primary_image_url    TEXT         NOT NULL,
  is_sold              BOOLEAN      NOT NULL DEFAULT FALSE,
  is_featured          BOOLEAN      NOT NULL DEFAULT FALSE,
  views                INTEGER      NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS vehicles_type_idx       ON vehicles (type);
CREATE INDEX IF NOT EXISTS vehicles_is_sold_idx    ON vehicles (is_sold);
CREATE INDEX IF NOT EXISTS vehicles_created_at_idx ON vehicles (created_at DESC);

-- Atomic view counter
CREATE OR REPLACE FUNCTION increment_vehicle_views(vehicle UUID)
RETURNS VOID LANGUAGE SQL AS $$
  UPDATE vehicles SET views = views + 1 WHERE id = vehicle;
$$;

-- ---------------------------------------------------------------------------
-- Leads
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id     UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  customer_name  VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20)  NOT NULL,
  status         VARCHAR(15)  NOT NULL DEFAULT 'new'
                   CHECK (status IN ('new', 'contacted', 'closed')),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_vehicle_id_idx ON leads (vehicle_id);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);

-- ---------------------------------------------------------------------------
-- Catalog: Makes → Models → Variants
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_makes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(80) NOT NULL,
  type       VARCHAR(10) NOT NULL CHECK (type IN ('car', 'bike')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, type)
);

CREATE TABLE IF NOT EXISTS vehicle_models (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make_id    UUID NOT NULL REFERENCES vehicle_makes(id) ON DELETE CASCADE,
  name       VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (make_id, name)
);

CREATE TABLE IF NOT EXISTS vehicle_variants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id   UUID NOT NULL REFERENCES vehicle_models(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (model_id, name)
);

CREATE INDEX IF NOT EXISTS vehicle_models_make_id_idx    ON vehicle_models (make_id);
CREATE INDEX IF NOT EXISTS vehicle_variants_model_id_idx ON vehicle_variants (model_id);
