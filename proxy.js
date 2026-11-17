<<<<<<< HEAD
// Next.js 16 Proxy (formerly Middleware).
// Optimistic admin protection: requests to /admin and /api/admin need a valid session
// token. Route handlers and pages re-verify on the server (lib/admin-session.js).
=======
// Next.js 16 Proxy (formerly Middleware)
// 1. Language routing: Tamil (default) is served without a prefix by rewriting
//    "/x" -> "/ta/x"; English lives under "/en". "/ta/..." redirects to the clean URL.
// 2. Optimistic admin protection: requests to /admin and /api/admin need a valid
//    session token. Route handlers and pages re-verify on the server.
>>>>>>> 6ef55310b926b8304db243483f45c8bf859d5e1b
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './lib/auth.js';

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/api/admin/auth/login'];

export async function proxy(request) {
<<<<<<< HEAD
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
=======
  const { pathname, search } = request.nextUrl;

  // ----- Admin area -----
  if (pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin')) {
    if (PUBLIC_ADMIN_PATHS.includes(pathname)) return NextResponse.next();
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (session) return NextResponse.next();
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/api/')) return NextResponse.next();

  // ----- Public site: language routing -----
  if (pathname === '/ta' || pathname.startsWith('/ta/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }
  if (pathname === '/en' || pathname.startsWith('/en/')) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/ta${pathname === '/' ? '' : pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals and static files (anything with a file extension).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)'],
>>>>>>> 6ef55310b926b8304db243483f45c8bf859d5e1b
};
