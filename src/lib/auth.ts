import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';

/**
 * Better Auth server config.
 *
 * Google is wired up as a social provider. After Google signs the user in,
 * better-auth sets its own session cookie via the Next.js catch-all handler at
 * `/api/auth/[...all]`, and the sign-in / sign-up pages then sync the Google
 * profile with the PizzaHub backend (`POST ${NEXT_PUBLIC_API_URL}/api/auth/google`)
 * so the backend JWT and the user role get stored through `setAuthSession`.
 */
export const auth = betterAuth({
  appName: 'PizzaHub',
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [nextCookies()],
});
