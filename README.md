# Cranes, Cranes, Cranes — The Lift Challenge

Discussion-first weekly challenge app for the "Cranes, Cranes, Cranes" LinkedIn community. No scoring, no correct answers — see `/mnt/user-data/outputs/cranes-lift-challenge-handoff.md` (or wherever you're keeping the handoff doc) for the full spec this was built from.

**Live:** https://cranes-lift-challenge-eta.vercel.app — deployed on Vercel, auto-deploys on push to `main`.

## Setup

1. `npm install`
2. Create a Supabase project. Run `supabase/migrations/001_init.sql` against it (SQL editor or CLI).
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — from your Supabase project settings.
   - `ANTHROPIC_API_KEY` — for the admin challenge generator.
   - `NEXT_PUBLIC_SITE_URL` — your deployed URL (or `http://localhost:3000` for local dev).
   - `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` — gates `/admin/*`. See the comment in `.env.example` for how to generate the secret.
4. `npm run dev` — visit `/admin/generate` to draft a challenge (you'll be redirected to `/admin/login` first), `/` to see published challenges, `/challenge/view?slug=challenge-1` for an individual challenge page.

## What's built vs. still to do

**Built:**
- Full data model (challenges, quick_takes, responses, engagement_snapshots, badges — no scoring/correctness fields anywhere)
- Admin generation flow: `/admin/generate` → AI drafts a challenge (title, scenario, question, quick-takes, LinkedIn post copy) as a **draft** — nothing publishes automatically
- Publish/unpublish toggle: on the generate page's result panel, and on `/admin/challenges` (lists every challenge regardless of status) — both call `/api/challenges/publish`
- Mid-week highlight-curation: `/admin/curate?slug=...` lists every response for a challenge, lets the admin toggle `highlighted`, manually log a standout LinkedIn comment (comment ingestion itself is intentionally not automated), and generate a highlights recap post draft that only quotes what's actually been highlighted
- Admin auth: a shared-password gate (`middleware.ts` + `/admin/login`) protects every `/admin/*` page and the mutating admin API routes; player-facing routes stay open
- Player-facing challenge page: spec-plate scenario card, quick-take poll (aggregate bar chart, no correctness), optional free-text reasoning, share button
- Homepage listing published challenges
- API routes for generation, publishing, highlighting, comment-logging, recap drafting, response submission, and poll aggregation

**Not yet built (flagged in the handoff doc as fast-follows, not MVP blockers):**
- Badge-awarding logic (the four seeded badges are participation/recognition-based; awarding them is a manual admin action for now per the handoff doc's Section 7 — LinkedIn comment ingestion is explicitly out of MVP scope)
- LinkedIn API posting (optional per the spec; copy/paste from the generated draft is the MVP path)

## Design notes

Visual identity follows a rigging-inspection-tag / load-chart aesthetic (the "spec plate" scenario card with corner brackets and rivet-dot corners) rather than a generic template look — see `app/globals.css` for the signature treatment, and `tailwind.config.ts` for the color/type tokens (Oswald display, IBM Plex Sans body, IBM Plex Mono for data labels).

## Known gotchas carried over from this portfolio's other Next.js/Supabase projects

- All server-side queries use `createAdminClient()` with **sequential queries, not joins** — joins silently return empty with the custom-JWT-hook-disabled RLS setup used across this portfolio.
- Routes use static paths with query params (`/challenge/view?slug=...`) rather than dynamic `[slug]` folders, since square-bracket folder names cause issues with Git on Windows.
