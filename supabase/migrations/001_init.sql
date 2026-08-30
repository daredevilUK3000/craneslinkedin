-- Cranes, Cranes, Cranes — The Lift Challenge
-- v2 discussion-first schema. No scoring, no correctness, no Master Key.

create extension if not exists "pgcrypto";

create table users (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  country text,
  linkedin_url text,
  created_at timestamptz not null default now()
);

create table challenges (
  id uuid primary key default gen_random_uuid(),
  challenge_number int not null unique,
  slug text not null unique,
  title text not null,
  scenario text not null,
  question text not null,
  format text not null check (format in ('open_judgment', 'trade_off', 'what_went_wrong', 'crowd_sourced')),
  category text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  disclaimer text not null default 'For professional discussion only. Not a substitute for site-specific procedures, manufacturer documentation, or qualified sign-off.',
  linkedin_post_draft text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table quick_takes (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  label text not null,
  sort_order int not null default 0
);

create table responses (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  quick_take_id uuid references quick_takes(id) on delete set null,
  free_text text,
  source text not null default 'app' check (source in ('app', 'linkedin_comment')),
  highlighted boolean not null default false,
  created_at timestamptz not null default now()
);

create table engagement_snapshots (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  snapshot_date date not null,
  impressions int,
  reactions int,
  comments int,
  unique_commenters int,
  group_joins int,
  notes text,
  created_at timestamptz not null default now()
);

create table badges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  criteria text not null
);

create table user_badges (
  user_id uuid not null references users(id) on delete cascade,
  badge_id uuid not null references badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- Seed participation-based badges (no correctness-based badges by design)
insert into badges (name, description, criteria) values
  ('Community Pick', 'Had a response highlighted by the admin', 'manual: admin flags a response as highlighted'),
  ('Discussion Starter', 'Among the first 5 commenters on a challenge, across multiple weeks', 'manual: admin tracks early commenters'),
  ('Consistent Voice', 'Participated 4+ weeks running', 'manual or query: distinct challenge_id count per user_id >= 4 in a rolling window'),
  ('Most Debated', 'Tapped a quick-take that ended up roughly evenly split with another option', 'manual: admin flags after reviewing poll results');

-- Row Level Security
alter table challenges enable row level security;
alter table quick_takes enable row level security;
alter table responses enable row level security;
alter table users enable row level security;

-- Public can read published challenges and their quick-takes/responses.
-- All writes go through server-side routes using the service-role client,
-- per this portfolio's established pattern (see lib/supabase/admin.ts) —
-- do not rely on client-side inserts against these policies.
create policy "public read published challenges"
  on challenges for select
  using (status = 'published');

create policy "public read quick takes of published challenges"
  on quick_takes for select
  using (
    challenge_id in (select id from challenges where status = 'published')
  );

create policy "public read responses of published challenges"
  on responses for select
  using (
    challenge_id in (select id from challenges where status = 'published')
  );

create policy "users can read their own row"
  on users for select
  using (true); -- display_name/country only; no sensitive fields on this table by design
