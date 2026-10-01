-- =====================================================================
-- CaterHub migration 002: accounts, password-reset codes, uploads
-- Run AFTER 001_caterhub_schema.sql.  Safe to run more than once.
-- Run in: Supabase Dashboard > SQL Editor > New query > paste > Run
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- users (customers and caterers)
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id             uuid primary key default gen_random_uuid(),
  role           text        not null check (role in ('customer', 'caterer')),
  name           text        not null check (char_length(name) between 2 and 120),
  email          text        not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  password_hash  text        not null,
  -- Bumped on every password change so older login tokens stop working.
  token_version  integer     not null default 0,
  id_type        text        not null default '',
  id_image       text,                          -- private: never returned by the API
  id_status      text        not null default 'pending'
                 check (id_status in ('pending', 'approved', 'rejected')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create unique index if not exists users_email_unique on public.users (lower(email));

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- password_resets (6-digit codes sent by email; only a hash is stored)
-- ---------------------------------------------------------------------
create table if not exists public.password_resets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid        not null references public.users(id) on delete cascade,
  code_hash   text        not null,
  expires_at  timestamptz not null,
  attempts    integer     not null default 0,
  used        boolean     not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists password_resets_user_idx on public.password_resets (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- images uploaded by caterers (cover photo, gallery)
-- ---------------------------------------------------------------------
create table if not exists public.images (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid        not null references public.users(id) on delete cascade,
  mime_type   text        not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  data        bytea       not null,
  created_at  timestamptz not null default now()
);

create index if not exists images_owner_idx on public.images (owner_id);

-- ---------------------------------------------------------------------
-- Link listings to the account that owns them
-- ---------------------------------------------------------------------
alter table public.caterers add column if not exists owner_id uuid references public.users(id) on delete cascade;
alter table public.caterers add column if not exists phone    text not null default '';
create unique index if not exists caterers_owner_unique on public.caterers (owner_id) where owner_id is not null;

alter table public.inquiries add column if not exists customer_id uuid references public.users(id) on delete set null;
create index if not exists inquiries_customer_idx on public.inquiries (customer_id, created_at desc);

-- ---------------------------------------------------------------------
-- SECURITY: these tables hold passwords, reset codes and ID photos.
-- Row Level Security with NO policies means the public Supabase keys
-- (anon / authenticated) can read or write nothing. Only the backend
-- server, connecting with DATABASE_URL, can touch them.
-- ---------------------------------------------------------------------
alter table public.users            enable row level security;
alter table public.password_resets  enable row level security;
alter table public.images           enable row level security;

revoke all on public.users           from anon, authenticated;
revoke all on public.password_resets from anon, authenticated;
revoke all on public.images          from anon, authenticated;

-- The public key should not be able to write to the catalogue either.
revoke insert, update, delete on public.caterers         from anon, authenticated;
revoke insert, update, delete on public.packages         from anon, authenticated;
revoke insert, update, delete on public.reviews          from anon, authenticated;
revoke all                    on public.inquiries        from anon, authenticated;
revoke all                    on public.contact_messages from anon, authenticated;
