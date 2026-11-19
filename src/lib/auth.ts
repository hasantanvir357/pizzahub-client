import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { nextCookies } from 'better-auth/next-js';

// Single source of truth for the app origin (from BETTER_AUTH_URL in .env.local).
const baseURL = (process.env.BETTER_AUTH_URL || 'http://localhost:3000').replace(/\/+$/, '');

/**
 * In-memory store for better-auth.
 *
 * No external database (e.g. MONGODB_URI) is configured in .env.local, but
 * better-auth needs somewhere to persist the Google user + session that are
 * created during the OAuth handshake (without it, the callback fails and
 * `authClient.getSession()` returns nothing). The collections are pre-seeded
 * with better-auth's models; data lives for as long as the dev server process.
 */
const db = {
  user: [],
  session: [],
  account: [],
  verification: [],
  jwks: [],
};

/**
 * Better Auth server config.
 *
 * Google is wired up as a social provider. After Google signs the user in,
 * better-auth's callback at `/api/auth/callback/google` (served by the
 * catch-all route at `src/app/api/auth/[...all]/route.ts`) verifies the OAuth
 * state + PKCE code, stores the user/session in the memory adapter and
 * redirects to `callbackURL`. The sign-in / sign-up pages then read that
 * session with `authClient.getSession()` and sync the Google profile with the
 * PizzaHub backend (`POST ${NEXT_PUBLIC_API_URL}/api/auth/google`) so the
 * backend JWT and the user role get stored through `setAuthSession`.
 */
export const auth = betterAuth({
  appName: 'PizzaHub',
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins: [baseURL],
  database: memoryAdapter(db),
  session: {
    cookieCache: { enabled: true, maxAge: 300 },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // Must be whitelisted as an authorized redirect URI for GOOGLE_CLIENT_ID
      // in the Google Cloud console.
      redirectURI: `${baseURL}/api/auth/callback/google`,
    },
  },
  plugins: [nextCookies()],
});
