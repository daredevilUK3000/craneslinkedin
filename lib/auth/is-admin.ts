import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, verifySessionToken } from './admin-session';

// Server-component helper for player-facing pages that want to show an
// "Admin" entry point without gating the page itself — the actual gate
// stays in middleware.ts. Safe to call from any server component.
export async function isAdminAuthenticated(): Promise<boolean> {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
