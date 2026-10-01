-- =====================================================================
-- CaterHub migration 003: accounts on Supabase Auth (no separate API server)
-- Run AFTER 001_caterhub_schema.sql. You do NOT need 002 any more.
-- Safe to run more than once.
-- Run in: Supabase Dashboard > SQL Editor > New query > paste > Run
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- profiles: one row per Supabase Auth user (the password lives in auth.users, not here)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text        not null check (role in ('customer', 'caterer')),
  name        text        not null check (char_length(name) between 2 and 120),
  email       text        not null,
  id_type     text        not null default '',
  id_status   text        not null default 'pending' check (id_status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Link listings / inquiries to the Supabase Auth user.
-- (If migration 002 was run before, its old links to public.users are replaced.)
-- ---------------------------------------------------------------------
alter table public.caterers  drop column if exists owner_id    cascade;
alter table public.inquiries drop column if exists customer_id cascade;

alter table public.caterers  add column owner_id    uuid references auth.users(id) on delete cascade;
alter table public.caterers  add column if not exists phone text not null default '';
alter table public.inquiries add column customer_id uuid references auth.users(id) on delete set null default auth.uid();

create unique index if not exists caterers_owner_unique on public.caterers (owner_id) where owner_id is not null;
create index if not exists inquiries_customer_idx on public.inquiries (customer_id, created_at desc);

-- ---------------------------------------------------------------------
-- Helper: is the signed-in user a customer / caterer?
-- ---------------------------------------------------------------------
create or replace function public.has_role(r text)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = r);
$$;

create or replace function public.owns_caterer(cid uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.caterers c where c.id = cid and c.owner_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- Sign-up trigger: Supabase Auth creates the user, this creates the profile
-- (and, for caterers, an unpublished business listing) from the sign-up form data.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  meta  jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  r     text  := coalesce(meta->>'role', 'customer');
  n     text  := left(trim(coalesce(meta->>'name', '')), 120);
  p     jsonb := case when jsonb_typeof(meta->'profile') = 'object' then meta->'profile' else '{}'::jsonb end;
begin
  if r not in ('customer', 'caterer') then r := 'customer'; end if;

  insert into public.profiles (id, role, name, email, id_type)
  values (new.id, r, n, coalesce(new.email, ''), left(coalesce(meta->>'id_type', ''), 60));

  if r = 'caterer' then
    insert into public.caterers
      (owner_id, name, tagline, description, location, phone, areas, event_types, service_styles,
       is_active, verified, available)
    values (
      new.id, n,
      left(coalesce(p->>'tagline', ''), 160),
      left(coalesce(p->>'description', ''), 3000),
      left(coalesce(p->>'location', ''), 160),
      left(coalesce(p->>'phone', ''), 40),
      coalesce(array(select left(x, 60) from jsonb_array_elements_text(case when jsonb_typeof(p->'areas') = 'array' then p->'areas' else '[]'::jsonb end) x limit 12), '{}'),
      coalesce(array(select left(x, 80) from jsonb_array_elements_text(case when jsonb_typeof(p->'eventTypes') = 'array' then p->'eventTypes' else '[]'::jsonb end) x limit 10), '{}'),
      coalesce(array(select left(x, 80) from jsonb_array_elements_text(case when jsonb_typeof(p->'serviceStyles') = 'array' then p->'serviceStyles' else '[]'::jsonb end) x limit 10), '{}'),
      false, false, true
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- A caterer listing goes public only when it has a description (20+ chars),
-- a location and at least one package. Seed listings (no owner) are left alone.
-- ---------------------------------------------------------------------
create or replace function public.caterers_compute_live()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if new.owner_id is not null then
    new.is_active := char_length(new.description) >= 20
                     and new.location <> ''
                     and exists (select 1 from public.packages p where p.caterer_id = new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists caterers_compute_live on public.caterers;
create trigger caterers_compute_live
  before insert or update on public.caterers
  for each row execute function public.caterers_compute_live();

create or replace function public.packages_refresh_listing()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare cid uuid := coalesce(new.caterer_id, old.caterer_id);
begin
  if tg_op = 'INSERT' and (select count(*) from public.packages where caterer_id = cid) > 20 then
    raise exception 'You can list up to 20 packages.';
  end if;
  -- touching the row re-runs caterers_compute_live
  update public.caterers set updated_at = now() where id = cid and owner_id is not null;
  return null;
end;
$$;

drop trigger if exists packages_refresh_listing on public.packages;
create trigger packages_refresh_listing
  after insert or update or delete on public.packages
  for each row execute function public.packages_refresh_listing();

-- Reviews are written by customers but update the caterer's rating, so this must run as the owner.
create or replace function public.refresh_caterer_rating()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare target uuid;
begin
  target := coalesce(new.caterer_id, old.caterer_id);
  update public.caterers c
     set rating       = coalesce((select round(avg(r.rating)::numeric, 1) from public.reviews r where r.caterer_id = target), 0),
         review_count = (select count(*) from public.reviews r where r.caterer_id = target)
   where c.id = target;
  return null;
end;
$$;

-- Inquiries: the caterer's name always comes from the database, never from the browser.
create or replace function public.inquiries_fill()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  new.caterer_name := coalesce((select c.name from public.caterers c where c.id = new.caterer_id), new.caterer_name);
  new.status := 'new';
  return new;
end;
$$;

drop trigger if exists inquiries_fill on public.inquiries;
create trigger inquiries_fill
  before insert on public.inquiries
  for each row execute function public.inquiries_fill();

-- ---------------------------------------------------------------------
-- Row Level Security. The public key can only do what these policies allow.
-- ---------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.caterers         enable row level security;
alter table public.packages         enable row level security;
alter table public.reviews          enable row level security;
alter table public.inquiries        enable row level security;
alter table public.contact_messages enable row level security;

-- Start from a clean slate for the grants (migration 002 revoked some of them).
revoke all on public.profiles, public.caterers, public.packages, public.reviews,
              public.inquiries, public.contact_messages from anon, authenticated;

-- profiles: you can read your own; you can rename yourself. Nothing else (role / ID status are locked).
grant select on public.profiles to authenticated;
grant update (name) on public.profiles to authenticated;
drop policy if exists "profiles read own"   on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles read own"   on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- caterers: everyone reads live listings; owners read and edit their own (but never rating / verified / is_active).
grant select on public.caterers to anon, authenticated;
grant update (name, tagline, description, location, areas, min_spend, capacity_min, capacity_max,
              response_time, event_types, service_styles, features, phone, available, image_url, gallery)
  on public.caterers to authenticated;
drop policy if exists "public read active caterers" on public.caterers;
drop policy if exists "caterers owner read"   on public.caterers;
drop policy if exists "caterers owner update" on public.caterers;
create policy "public read active caterers" on public.caterers for select to anon, authenticated using (is_active = true);
create policy "caterers owner read"   on public.caterers for select to authenticated using (owner_id = auth.uid());
create policy "caterers owner update" on public.caterers for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- packages: everyone reads packages of live listings; owners manage their own.
grant select on public.packages to anon, authenticated;
grant insert, update, delete on public.packages to authenticated;
drop policy if exists "public read packages"  on public.packages;
drop policy if exists "packages owner all"    on public.packages;
create policy "public read packages" on public.packages for select to anon, authenticated
  using (exists (select 1 from public.caterers c where c.id = caterer_id and c.is_active));
create policy "packages owner all" on public.packages for all to authenticated
  using (public.owns_caterer(caterer_id)) with check (public.owns_caterer(caterer_id));

-- reviews: everyone reads; logged-in customers write.
grant select on public.reviews to anon, authenticated;
grant insert on public.reviews to authenticated;
drop policy if exists "public read reviews"      on public.reviews;
drop policy if exists "reviews customers insert" on public.reviews;
create policy "public read reviews" on public.reviews for select to anon, authenticated
  using (exists (select 1 from public.caterers c where c.id = caterer_id and c.is_active));
create policy "reviews customers insert" on public.reviews for insert to authenticated
  with check (public.has_role('customer') and exists (select 1 from public.caterers c where c.id = caterer_id and c.is_active));

-- inquiries: customers send and read their own; caterers read theirs and change the status.
grant select, insert on public.inquiries to authenticated;
grant update (status) on public.inquiries to authenticated;
drop policy if exists "inquiries customer insert" on public.inquiries;
drop policy if exists "inquiries read"            on public.inquiries;
drop policy if exists "inquiries caterer update"  on public.inquiries;
create policy "inquiries customer insert" on public.inquiries for insert to authenticated
  with check (customer_id = auth.uid() and public.has_role('customer')
              and exists (select 1 from public.caterers c where c.id = caterer_id and c.is_active));
create policy "inquiries read" on public.inquiries for select to authenticated
  using (customer_id = auth.uid() or public.owns_caterer(caterer_id));
create policy "inquiries caterer update" on public.inquiries for update to authenticated
  using (public.owns_caterer(caterer_id)) with check (public.owns_caterer(caterer_id));

-- contact form: anyone may send a message; nobody can read them through the public key
-- (read them in Supabase > Table Editor).
grant insert on public.contact_messages to anon, authenticated;
drop policy if exists "contact anyone insert" on public.contact_messages;
create policy "contact anyone insert" on public.contact_messages for insert to anon, authenticated with check (true);

-- ---------------------------------------------------------------------
-- Storage
--   id-verification : PRIVATE. Each user can upload / read only their own ID photo.
--   caterer-photos  : PUBLIC to view. Only caterers can upload, only into their own folder.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('id-verification', 'id-verification', false, 5242880, array['image/jpeg']),
  ('caterer-photos',  'caterer-photos',  true,  2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "id photo insert own" on storage.objects;
drop policy if exists "id photo read own"   on storage.objects;
drop policy if exists "id photo update own" on storage.objects;
create policy "id photo insert own" on storage.objects for insert to authenticated
  with check (bucket_id = 'id-verification' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "id photo read own" on storage.objects for select to authenticated
  using (bucket_id = 'id-verification' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "id photo update own" on storage.objects for update to authenticated
  using (bucket_id = 'id-verification' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "caterer photo insert own" on storage.objects;
drop policy if exists "caterer photo list own"   on storage.objects;
drop policy if exists "caterer photo delete own" on storage.objects;
create policy "caterer photo insert own" on storage.objects for insert to authenticated
  with check (bucket_id = 'caterer-photos' and (storage.foldername(name))[1] = auth.uid()::text and public.has_role('caterer'));
create policy "caterer photo list own" on storage.objects for select to authenticated
  using (bucket_id = 'caterer-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "caterer photo delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'caterer-photos' and (storage.foldername(name))[1] = auth.uid()::text);
