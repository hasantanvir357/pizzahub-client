import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('pizzahub_token')?.value;
  const { pathname } = request.nextUrl;

  // Detect a full document load vs. a client-side (RSC) navigation.
  //
  // Next.js strips the internal Flight headers (`rsc`, `next-router-state-tree`,
  // `next-router-prefetch`) from the request before Proxy sees it, so reading
  // them here never matches — the old check was always false and every
  // cookie-less request to /dashboard (including soft navigations) was
  // redirected to /sign-in, which looked like an instant logout. Use the
  // browser's Sec-Fetch-* headers instead: document loads send
  // `Sec-Fetch-Dest: document` / `Sec-Fetch-Mode: navigate`, while RSC
  // fetches and prefetches send `empty` / `cors`. Requests without any
  // Sec-Fetch headers (curl, tests, non-browser clients) are treated as
  // document loads so the guard still applies to them.
  const secFetchDest = request.headers.get('sec-fetch-dest');
  const secFetchMode = request.headers.get('sec-fetch-mode');
  const isDocumentNavigation =
    !secFetchDest && !secFetchMode
      ? true
      : secFetchDest === 'document' || secFetchMode === 'navigate';

  // A session that exists only in localStorage can never be falsely bounced
  // mid-navigation: soft navigations skip this guard (see above), and the
  // dashboard layout performs the authoritative, hydration-aware client check
  // instead. Only full document loads without a cookie are redirected.
  if (pathname.startsWith('/dashboard') && !token && isDocumentNavigation) {
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
