// Next.js 16 Proxy (formerly Middleware).
// Optimistic admin protection: requests to /admin and /api/admin need a valid session
// token. Route handlers and pages re-verify on the server (lib/admin-session.js).
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './lib/auth.js';

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/api/admin/auth/login'];

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_ADMIN_PATHS.includes(pathname)) return NextResponse.next();
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = request.nextUrl.clone();
  url.pathname = '/admin/login';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};
