-- CaterHub: store the extra sign-up fields (phone for customers, contact name for caterers).
-- Safe to run more than once. Run it in Supabase > SQL Editor after 003_supabase_auth.sql.
-- The website works without this migration; these two details are simply not saved until it is run.

alter table public.profiles  add column if not exists phone        text not null default '';
alter table public.caterers  add column if not exists contact_name text not null default '';

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

  insert into public.profiles (id, role, name, email, id_type, phone)
  values (new.id, r, n, coalesce(new.email, ''), left(coalesce(meta->>'id_type', ''), 60), left(coalesce(meta->>'phone', ''), 40));

  if r = 'caterer' then
    insert into public.caterers
      (owner_id, name, contact_name, tagline, description, location, phone, areas, event_types, service_styles,
       is_active, verified, available)
    values (
      new.id, n,
      left(coalesce(meta->>'contact_name', p->>'contactName', ''), 120),
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
