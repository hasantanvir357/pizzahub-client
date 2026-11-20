import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('pizzahub_token')?.value;
  const { pathname } = request.nextUrl;

  // A client-side (RSC) navigation request — Next.js sends the router state
  // tree (and `RSC=1` on fetch) for soft navigations. The auth cookie is set
  // by `setAuthSession()` on every login path (password, Google, OAuth
  // sync), but skipping the guard for soft navigations means a session that
  // exists only in localStorage can never be falsely bounced to /sign-in
  // mid-navigation; the dashboard layout performs the authoritative,
  // hydration-aware client check instead.
  const isClientNavigation =
    request.headers.get('RSC') === '1' ||
    request.headers.has('Next-Router-State-Tree');

  // Protect /dashboard routes (full document loads only).
  if (pathname.startsWith('/dashboard') && !token && !isClientNavigation) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Redirect logged-in users away from sign-in/sign-up to the home page.
  // (Checked on every request type — a present cookie is authoritative, and
  // this redirect only ever moves signed-in users away from auth screens.)
  if ((pathname === '/sign-in' || pathname === '/sign-up') && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up'],
};
