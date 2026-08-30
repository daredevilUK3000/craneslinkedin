import { createClient } from '@supabase/supabase-js';

/**
 * Browser-side anon client. Reads only (RLS policies allow public select on
 * published challenges/quick_takes/responses). All writes go through the
 * API routes under app/api/, which use the admin client server-side.
 */
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anonKey);
}
