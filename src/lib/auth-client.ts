import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth browser client.
 *
 * Used by the sign-in / sign-up pages for the "Continue with Google" button
 * (`authClient.signIn.social({ provider: "google" })`). The session cookie is
 * issued by `/api/auth/[...all]`; the pages read it with
 * `authClient.getSession()` and sync the user with the PizzaHub backend.
 *
 * No baseURL needed: the auth handler lives on this same origin
 * (http://localhost:3000/api/auth).
 */
export const authClient = createAuthClient();
