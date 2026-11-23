import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Lightweight route proxy.
 *
 * Dashboard access is deliberately NOT decided here: the dashboard layout
 * performs the authoritative, hydration-aware session check in the browser.
 * A server-side cookie check used to redirect cookie-less soft navigations to
 * /sign-in even when the session still existed in localStorage, which looked
 * like an instant logout after clicking "Dashboard".
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get('pizzahub_token')?.value;
  const { pathname } = request.nextUrl;

  // Only keep signed-in users away from the auth screens. This never clears or
  // overwrites the cookie; it is a read-only redirect.
  if ((pathname === '/sign-in' || pathname === '/sign-up') && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/sign-in', '/sign-up'],
};
