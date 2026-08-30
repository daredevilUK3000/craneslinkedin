-- Tracks when the admin last checked responses, to power a "N new
-- since you last checked" badge. Single-admin app, no per-user auth yet,
-- so one global timestamp is sufficient — if multi-admin auth is ever
-- added, this needs to become per-user instead of global.

create table admin_activity (
  id boolean primary key default true,
  last_checked_responses_at timestamptz not null default now(),
  constraint admin_activity_singleton check (id)
);

insert into admin_activity (id, last_checked_responses_at) values (true, now());
