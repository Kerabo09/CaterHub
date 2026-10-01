-- =====================================================================
-- CaterHub database schema  (Supabase / PostgreSQL)
-- Safe to run more than once: every statement is idempotent.
-- Run in: Supabase Dashboard > SQL Editor > New query > paste > Run
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Shared helper: keep updated_at current
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- caterers
-- ---------------------------------------------------------------------
create table if not exists public.caterers (
  id              uuid primary key default gen_random_uuid(),
  name            text        not null check (char_length(name) between 2 and 120),
  tagline         text        not null default '',
  description     text        not null default '',
  location        text        not null default '',
  areas           text[]      not null default '{}',
  min_spend       integer     not null default 0 check (min_spend >= 0),
  capacity_min    integer     not null default 1 check (capacity_min >= 1),
  capacity_max    integer     not null default 100 check (capacity_max >= 1),
  response_time   text        not null default '24 hours',
  rating          numeric(2,1) not null default 0 check (rating between 0 and 5),
  review_count    integer     not null default 0 check (review_count >= 0),
  event_types     text[]      not null default '{}',
  service_styles  text[]      not null default '{}',
  verified        boolean     not null default false,
  available       boolean     not null default true,
  is_active       boolean     not null default true,
  image_url       text        not null default '',
  gallery         text[]      not null default '{}',
  features        text[]      not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint caterers_capacity_range check (capacity_max >= capacity_min)
);

create index if not exists caterers_active_idx   on public.caterers (is_active);
create index if not exists caterers_min_spend_idx on public.caterers (min_spend);

drop trigger if exists caterers_set_updated_at on public.caterers;
create trigger caterers_set_updated_at
  before update on public.caterers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- packages (menus / pricing tiers offered by a caterer)
-- ---------------------------------------------------------------------
create table if not exists public.packages (
  id               uuid primary key default gen_random_uuid(),
  caterer_id       uuid    not null references public.caterers(id) on delete cascade,
  name             text    not null,
  description      text    not null default '',
  price_per_guest  integer not null check (price_per_guest >= 0),
  min_guests       integer not null default 1 check (min_guests >= 1),
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now()
);

create index if not exists packages_caterer_idx on public.packages (caterer_id, sort_order);

-- ---------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------
create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  caterer_id     uuid    not null references public.caterers(id) on delete cascade,
  reviewer_name  text    not null check (char_length(reviewer_name) between 1 and 80),
  rating         integer not null check (rating between 1 and 5),
  content        text    not null check (char_length(content) between 1 and 2000),
  event_type     text    not null default '',
  created_at     timestamptz not null default now()
);

create index if not exists reviews_caterer_idx on public.reviews (caterer_id, created_at desc);

-- Keep caterers.rating / review_count in sync automatically
create or replace function public.refresh_caterer_rating()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target uuid;
begin
  target := coalesce(new.caterer_id, old.caterer_id);
  update public.caterers c
     set rating       = coalesce((select round(avg(r.rating)::numeric, 1) from public.reviews r where r.caterer_id = target), 0),
         review_count = (select count(*) from public.reviews r where r.caterer_id = target)
   where c.id = target;
  return null;
end;
$$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_caterer_rating();

-- ---------------------------------------------------------------------
-- inquiries (customer -> caterer)
-- ---------------------------------------------------------------------
create table if not exists public.inquiries (
  id              uuid primary key default gen_random_uuid(),
  caterer_id      uuid    not null references public.caterers(id) on delete cascade,
  caterer_name    text    not null,
  customer_name   text    not null check (char_length(customer_name) between 1 and 120),
  customer_email  text    not null check (customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  event_date      date,
  guest_count     integer not null default 0 check (guest_count >= 0),
  event_type      text    not null default '',
  message         text    not null default '',
  status          text    not null default 'new'
                  check (status in ('new','read','replied','booked','declined','archived')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists inquiries_caterer_idx on public.inquiries (caterer_id, created_at desc);
create index if not exists inquiries_status_idx  on public.inquiries (status);

drop trigger if exists inquiries_set_updated_at on public.inquiries;
create trigger inquiries_set_updated_at
  before update on public.inquiries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- contact_messages (Contact page)
-- ---------------------------------------------------------------------
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null check (char_length(full_name) between 1 and 120),
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  topic       text not null default '',
  event_name  text not null default '',
  message     text not null check (char_length(message) between 1 and 5000),
  handled     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Row Level Security
--   * Public (anon) may READ the catalogue only.
--   * All writes (inquiries, contact, reviews) go through the Edge Function,
--     which uses the service-role key and validates input.
--   * inquiries / contact_messages contain personal data: no public access.
-- ---------------------------------------------------------------------
alter table public.caterers         enable row level security;
alter table public.packages         enable row level security;
alter table public.reviews          enable row level security;
alter table public.inquiries        enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "public read active caterers" on public.caterers;
create policy "public read active caterers" on public.caterers
  for select using (is_active = true);

drop policy if exists "public read packages" on public.packages;
create policy "public read packages" on public.packages
  for select using (exists (select 1 from public.caterers c where c.id = caterer_id and c.is_active));

drop policy if exists "public read reviews" on public.reviews;
create policy "public read reviews" on public.reviews
  for select using (exists (select 1 from public.caterers c where c.id = caterer_id and c.is_active));

-- ---------------------------------------------------------------------
-- Seed data (fixed IDs so re-running never duplicates)
-- ---------------------------------------------------------------------
insert into public.caterers
  (id, name, tagline, description, location, areas, min_spend, capacity_min, capacity_max,
   response_time, event_types, service_styles, verified, available, image_url, gallery, features)
values
('a1000000-0000-4000-8000-000000000001',
 'Casa Dela Rosa Catering',
 'Filipino heirloom recipes for weddings and grand celebrations.',
 'A family-run kitchen serving Metro Manila for over 15 years. We specialise in festive Filipino spreads, lechon, and full wedding menus with in-house styling and service staff.',
 'Quezon City, Metro Manila',
 '{"Quezon City","Makati","Pasig"}', 45000, 50, 400, '2 hours',
 '{"Weddings & Nuptials","Social Gatherings & Anniversaries","Birthdays & Milestones"}',
 '{"Buffet Station Setup","Formal Plated Courses","Live Culinary Station"}',
 true, true,
 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=500&fit=crop&auto=format',
 '{"https://images.unsplash.com/photo-1555244162-803834f70033?w=900&h=500&fit=crop&auto=format","https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop&auto=format","https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=200&fit=crop&auto=format"}',
 '{"Free food tasting","Uniformed service staff","Table and chair rental","Customisable menus"}'),

('a1000000-0000-4000-8000-000000000002',
 'Tondo Feast Caterers',
 'Affordable, generous portions for fiestas and family gatherings.',
 'Community-favourite caterer serving Tondo, Manila and nearby districts. Great value packages for birthdays, fiestas, school events and church banquets.',
 'Tondo, Manila',
 '{"Tondo","Sampaloc","Caloocan"}', 15000, 30, 250, '4 hours',
 '{"Birthdays & Milestones","School & Church Banquets","Social Gatherings & Anniversaries"}',
 '{"Buffet Station Setup","Packed/Meals Delivery"}',
 true, true,
 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop&auto=format',
 '{"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=500&fit=crop&auto=format","https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=200&fit=crop&auto=format","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=200&fit=crop&auto=format"}',
 '{"Budget-friendly packages","Free delivery within Manila","Flexible payment terms"}'),

('a1000000-0000-4000-8000-000000000003',
 'Metro Corporate Kitchen',
 'Reliable catering for conferences, launches and office events.',
 'Built for corporate clients: punctual setup, dietary labelling, and scalable service for 20 to 800 guests. Recurring-program pricing available.',
 'Makati, Metro Manila',
 '{"Makati","BGC","Ortigas"}', 60000, 20, 800, '1 hour',
 '{"Corporate Events","Banquets & Major Conventions","Holiday & Seasonal Celebrations"}',
 '{"Buffet Station Setup","Packed/Meals Delivery","Cocktail & Grazing Table"}',
 true, true,
 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop&auto=format',
 '{"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&h=500&fit=crop&auto=format","https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=200&fit=crop&auto=format","https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=200&fit=crop&auto=format"}',
 '{"Dietary and halal options","Invoice and official receipt","On-site coordinator"}'),

('a1000000-0000-4000-8000-000000000004',
 'Lola Nena''s Table',
 'Intimate dinners with home-style Kapampangan cooking.',
 'Small-batch, made-to-order menus for dinners and gatherings of up to 60 guests. Ingredients are sourced from local farms and markets.',
 'San Fernando, Pampanga',
 '{"San Fernando","Angeles","Mabalacat"}', 20000, 10, 60, '3 hours',
 '{"Intimate Dinners & Gatherings","Birthdays & Milestones","Holiday & Seasonal Celebrations"}',
 '{"Formal Plated Courses","Cocktail & Grazing Table"}',
 true, false,
 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop&auto=format',
 '{"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=500&fit=crop&auto=format","https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=200&fit=crop&auto=format","https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=200&fit=crop&auto=format"}',
 '{"Chef-hosted dinners","Locally sourced ingredients","Menu tasting on request"}'),

('a1000000-0000-4000-8000-000000000005',
 'Grand Banquet Masters',
 'Full-service banquets for conventions, school and church events.',
 'Large-scale catering with a dedicated logistics team, mobile kitchen units and plated or buffet options for 200 to 1,500 guests.',
 'Cebu City, Cebu',
 '{"Cebu City","Mandaue","Lapu-Lapu"}', 90000, 200, 1500, '6 hours',
 '{"Banquets & Major Conventions","School & Church Banquets","Weddings & Nuptials"}',
 '{"Buffet Station Setup","Formal Plated Courses","Live Culinary Station"}',
 false, true,
 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=500&fit=crop&auto=format',
 '{"https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=900&h=500&fit=crop&auto=format","https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=400&h=200&fit=crop&auto=format","https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=200&fit=crop&auto=format"}',
 '{"Mobile kitchen units","Large-event logistics","Stage and sound coordination"}'),

('a1000000-0000-4000-8000-000000000006',
 'Sweet & Savory Grazing Co.',
 'Modern grazing tables and cocktail spreads.',
 'Styled grazing tables, canapes and dessert bars for cocktail parties, bridal showers and holiday parties.',
 'Taguig, Metro Manila',
 '{"Taguig","BGC","Pasay"}', 25000, 15, 150, '2 hours',
 '{"Social Gatherings & Anniversaries","Holiday & Seasonal Celebrations","Corporate Events"}',
 '{"Cocktail & Grazing Table","Live Culinary Station"}',
 true, true,
 'https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=800&h=500&fit=crop&auto=format',
 '{"https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=900&h=500&fit=crop&auto=format","https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=200&fit=crop&auto=format","https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=200&fit=crop&auto=format"}',
 '{"Styled table setup","Vegan and gluten-free options","Themed dessert bars"}')
on conflict (id) do nothing;

insert into public.packages (id, caterer_id, name, description, price_per_guest, min_guests, sort_order)
values
('b1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','Classic Fiesta','Four mains, two sides, rice, dessert and drinks.',650,50,1),
('b1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000001','Grand Wedding','Five-course plated menu with lechon, cake table and full service.',1250,80,2),
('b1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000002','Barrio Buffet','Three mains, one veggie, rice and drinks.',350,30,1),
('b1000000-0000-4000-8000-000000000004','a1000000-0000-4000-8000-000000000002','Party Packed Meals','Individually boxed meals with delivery included.',180,50,2),
('b1000000-0000-4000-8000-000000000005','a1000000-0000-4000-8000-000000000003','Executive Lunch','Buffet lunch with dietary labels and coffee service.',720,20,1),
('b1000000-0000-4000-8000-000000000006','a1000000-0000-4000-8000-000000000003','Conference Day','Morning snacks, lunch and afternoon break for full-day events.',980,50,2),
('b1000000-0000-4000-8000-000000000007','a1000000-0000-4000-8000-000000000004','Chef''s Table','Five-course Kapampangan tasting dinner.',1500,10,1),
('b1000000-0000-4000-8000-000000000008','a1000000-0000-4000-8000-000000000005','Convention Buffet','Multi-station buffet with mobile kitchen support.',550,200,1),
('b1000000-0000-4000-8000-000000000009','a1000000-0000-4000-8000-000000000006','Signature Grazing Table','Cheeses, cured meats, fruit, dips and breads.',480,15,1),
('b1000000-0000-4000-8000-000000000010','a1000000-0000-4000-8000-000000000006','Cocktail Party','Canapes, dessert bar and welcome drinks.',820,30,2)
on conflict (id) do nothing;

insert into public.reviews (id, caterer_id, reviewer_name, rating, content, event_type)
values
('c1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','Maricel T.',5,'The lechon was the star of our wedding. Guests are still talking about it.','Wedding'),
('c1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000001','Paolo R.',4,'Professional staff and very responsive planning. Slight delay on dessert setup.','Anniversary'),
('c1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000002','Aling Cora',5,'Sulit na sulit ang price at masarap ang food. Highly recommended for fiestas.','Birthday'),
('c1000000-0000-4000-8000-000000000004','a1000000-0000-4000-8000-000000000003','Daniel K.',5,'On time, well labelled, and easy to work with for our quarterly town hall.','Corporate'),
('c1000000-0000-4000-8000-000000000005','a1000000-0000-4000-8000-000000000003','Sheila M.',4,'Reliable for recurring office lunches. Invoicing was smooth.','Corporate'),
('c1000000-0000-4000-8000-000000000006','a1000000-0000-4000-8000-000000000004','Ramon D.',5,'Felt like eating at grandma''s house. Beautiful and very personal.','Intimate Dinner'),
('c1000000-0000-4000-8000-000000000007','a1000000-0000-4000-8000-000000000005','Fr. Emmanuel',4,'Handled 900 guests at our parish anniversary without a hitch.','Church Banquet'),
('c1000000-0000-4000-8000-000000000008','a1000000-0000-4000-8000-000000000006','Bea L.',5,'The grazing table looked stunning and disappeared in an hour.','Bridal Shower')
on conflict (id) do nothing;
