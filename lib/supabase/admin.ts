import { createClient } from '@supabase/supabase-js';

/**
 * Server-side admin client (service role key — never expose to the client).
 *
 * Per this portfolio's established Supabase pattern: all server-side queries
 * use this admin client with SEQUENTIAL queries, not joins — joins silently
 * return empty here because the custom JWT hook is disabled. If you need
 * data from two tables, fetch each separately and combine in application
 * code (see app/challenge/view/page.tsx for an example).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.'
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
    global: {
      // Next.js patches the global fetch() and caches responses by default,
      // including ones made internally by this client — route-level
      // `dynamic = 'force-dynamic'` isn't reliably enough to stop it (seen
      // in dev: a challenge published after the first request kept
      // serving the stale pre-publish result). Force no-store here so admin
      // reads are never subject to Next's fetch cache.
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}
