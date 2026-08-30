# Cranes, Cranes, Cranes — The Lift Challenge

Discussion-first weekly challenge app for the "Cranes, Cranes, Cranes" LinkedIn community. No scoring, no correct answers — see `/mnt/user-data/outputs/cranes-lift-challenge-handoff.md` (or wherever you're keeping the handoff doc) for the full spec this was built from.

**Live:** https://cranes-lift-challenge-eta.vercel.app — deployed on Vercel, auto-deploys on push to `main`.

## Setup

1. `npm install`
2. Create a Supabase project. Run `supabase/migrations/001_init.sql`, then `002_add_company.sql`, against it (SQL editor or CLI) — in that order.
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
- Engagement tracking: same page also has a manual log for `engagement_snapshots` (impressions, reactions, comments, unique commenters, group joins, notes) — LinkedIn doesn't expose these to a non-partner app, so it's a check-in log, not a scrape
- The Friday-highlights framing ("editor curating good discussion, not an authority declaring winners") is now baked into both the generated LinkedIn post copy and a line on the challenge page itself, not just admin-side intent
- "Copy Challenge Link" button on `/admin/generate` and `/admin/challenges` — the generated post text deliberately omits the app URL (outbound links suppress LinkedIn reach), so this is meant to go in as the first comment instead
- Admin auth: a shared-password gate (`middleware.ts` + `/admin/login`) protects every `/admin/*` page and the mutating admin API routes; player-facing routes stay open
- An "Admin" link + Log In/Log Out toggle now sits in the top-right corner of the homepage and the challenge view page (`AdminEntryBar`), so there's a way back into the admin area without typing a URL from memory
- Optional "Your Name" / "Your Company" fields on the in-app quick-take submission form (previously fully anonymous with no way to opt in), plus a matching "Commenter Company" field on the admin's LinkedIn-comment logger — both flow through to `/admin/curate` (shown as "Name — Company") and into the recap generator, which credits the company by name in the drafted post when given (e.g. "Priya K. of Northline Rigging")
- Player-facing challenge page: spec-plate scenario card, quick-take poll (aggregate bar chart, no correctness), optional free-text reasoning, share button
- Homepage listing published challenges
- API routes for generation, publishing, highlighting, comment-logging, recap drafting, engagement logging, response submission, and poll aggregation

**Not yet built (flagged in the handoff doc as fast-follows, not MVP blockers):**
- Badge-awarding logic (the four seeded badges are participation/recognition-based; awarding them is a manual admin action for now per the handoff doc's Section 7 — LinkedIn comment ingestion is explicitly out of MVP scope)
- LinkedIn API posting (optional per the spec; copy/paste from the generated draft is the MVP path)

## Design notes

Visual identity follows a rigging-inspection-tag / load-chart aesthetic (the "spec plate" scenario card with corner brackets and rivet-dot corners) rather than a generic template look — see `app/globals.css` for the signature treatment, and `tailwind.config.ts` for the color/type tokens (Oswald display, IBM Plex Sans body, IBM Plex Mono for data labels).

`components/CraneMasthead.tsx` is a deliberate design choice, not scaffold noise: a full video/photo hero behind the challenge card was considered and rejected (load-time risk in a LinkedIn in-app browser, fights the mobile-first requirement, competes with the spec-plate for attention). It's a dark steel band with an inline-SVG line-art tower-crane silhouette instead — pure CSS/SVG, nothing to buffer, nothing animated so no `prefers-reduced-motion` handling needed. It sits above the card on both the homepage and the challenge view page — keep it on every player-facing page.

## Known gotchas carried over from this portfolio's other Next.js/Supabase projects

- All server-side queries use `createAdminClient()` with **sequential queries, not joins** — joins silently return empty with the custom-JWT-hook-disabled RLS setup used across this portfolio.
- Routes use static paths with query params (`/challenge/view?slug=...`) rather than dynamic `[slug]` folders, since square-bracket folder names cause issues with Git on Windows.
