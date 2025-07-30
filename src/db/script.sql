-- Enable UUID generation
create extension if not exists "pgcrypto";

--------------------------------------------------
-- 1.  Companies  (tenants)
--------------------------------------------------
create table public.companies (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  industry      text,
  logo_url      text,
  created_at    timestamptz default now()
);

--------------------------------------------------
-- 2.  Users  (profiles – links to auth.users)
--------------------------------------------------
create table public.users (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid references public.companies(id) on delete cascade,
  full_name      text not null,
  email          text unique not null,
  password_hash  text not null,       -- securely store hashed passwords (bcrypt, argon2, etc.)
  role           text check (role in ('admin','supervisor','driver','mechanic')) not null,
  is_active      boolean default true,
  created_at     timestamptz default now()
);


--------------------------------------------------
-- 3.  Vehicles
--------------------------------------------------
create table public.vehicles (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid references public.companies(id) on delete cascade,
  name           text,
  license_plate  text unique,
  vehicle_type   text,
  site           text,
  is_active      boolean default true,
  created_at     timestamptz default now()
);

--------------------------------------------------
-- 4.  Checklist Templates
--------------------------------------------------
create table public.checklist_templates (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid references public.companies(id) on delete cascade,
  title          text not null,
  vehicle_type   text,            -- optional filter
  is_active      boolean default true,
  created_at     timestamptz default now()
);

--------------------------------------------------
-- 5.  Checklist Items  (dynamic “columns”)
--------------------------------------------------
create table public.checklist_items (
  id              uuid primary key default gen_random_uuid(),
  template_id     uuid references public.checklist_templates(id) on delete cascade,
  label           text not null,           -- e.g. “Brake fluid level”
  input_type      text default 'boolean',  -- boolean, text, number, photo, etc.
  is_required     boolean default true,
  sort_order      int default 0,
  created_at      timestamptz default now()
);

--------------------------------------------------
-- 6.  Inspections  (header)
--------------------------------------------------
create table public.inspections (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid references public.companies(id) on delete cascade,
  vehicle_id       uuid references public.vehicles(id) on delete cascade,
  user_id          uuid references public.users(id) on delete set null,
  template_id      uuid references public.checklist_templates(id),
  status           text check (status in ('pass','fail','needs_attention')),
  notes            text,
  photo_urls       jsonb default '[]',         -- array of image URLs
  latitude         numeric,                    -- optional geotag
  longitude        numeric,
  created_at       timestamptz default now()
);

--------------------------------------------------
-- 7.  Inspection Answers  (1 row per checklist item)
--------------------------------------------------
create table public.inspection_answers (
  id               uuid primary key default gen_random_uuid(),
  inspection_id    uuid references public.inspections(id) on delete cascade,
  item_id          uuid references public.checklist_items(id) on delete cascade,
  value_bool       boolean,
  value_text       text,
  value_number     numeric,
  value_photo_url  text,
  constraint one_value check (
    (value_bool is not null)::int +
    (value_text is not null)::int +
    (value_number is not null)::int +
    (value_photo_url is not null)::int = 1
  )
);

--------------------------------------------------
-- 8.  Issues  (ad-hoc fault reports)
--------------------------------------------------
create table public.issues (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid references public.companies(id) on delete cascade,
  vehicle_id       uuid references public.vehicles(id) on delete cascade,
  reported_by      uuid references public.users(id) on delete set null,
  severity         text check (severity in ('low','medium','critical')),
  description      text,
  photo_urls       jsonb default '[]',
  resolved         boolean default false,
  created_at       timestamptz default now()
);

--------------------------------------------------
-- 9.  Notifications  (user activity & alerts)
--------------------------------------------------
create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid references public.companies(id) on delete cascade,
  user_id      uuid references public.users(id) on delete cascade,
  type         text not null,      -- e.g. 'inspection_failed'
  payload      jsonb,              -- flexible client data
  is_read      boolean default false,
  created_at   timestamptz default now()
);

--------------------------------------------------
-- 10. Audit Logs  (optional, but handy)
--------------------------------------------------
create table public.audit_logs (
  id           bigserial primary key,
  company_id   uuid,               -- nullable for system/global actions
  actor_id     uuid,               -- user who performed action
  action       text,               -- 'template.update', 'vehicle.create', etc.
  target_id    uuid,               -- object affected
  details      jsonb,
  created_at   timestamptz default now()
);

--------------------------------------------------
-- Index suggestions for faster look-ups
--------------------------------------------------
create index on public.users          (company_id);
create index on public.vehicles       (company_id);
create index on public.checklist_templates (company_id);
create index on public.inspections    (company_id, vehicle_id, created_at desc);
create index on public.issues         (company_id, resolved);
create index on public.notifications  (user_id, is_read);

-- Done.  Add triggers / RLS later from your Node.js backend as desired.
