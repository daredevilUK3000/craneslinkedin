import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/auth/admin-session';

// Gates every /admin/* page plus the mutating admin API routes (generate,
// publish, recap, highlight, log-comment) behind a signed session cookie.
// Player-facing routes (/, /challenge/view, /api/poll,
// /api/responses/submit) are untouched — this app stays anonymous-by-default
// for players; only the admin surface needs a login.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authenticated = await verifySessionToken(token);

  if (authenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/admin/login', req.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/challenges/generate',
    '/api/challenges/publish',
    '/api/challenges/recap',
    '/api/responses/highlight',
    '/api/responses/log',
  ],
};
