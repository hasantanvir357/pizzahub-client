import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth';

/**
 * Better Auth catch-all handler.
 *
 * Serves every `/api/auth/*` request on this origin:
 *   - POST /api/auth/sign-in/social   -> returns the Google authorization URL
 *   - GET  /api/auth/callback/google  -> OAuth state + PKCE code exchange,
 *                                        stores the user/session, redirects
 *                                        to the page's callbackURL
 *   - GET  /api/auth/session          -> reads the session back for the client
 *
 * (This file previously returned a 501 "not configured" placeholder, which made
 * `authClient.signIn.social` fail immediately with "Google sign-in failed".)
 */
const handlers = toNextJsHandler(auth.handler);

export const GET = handlers.GET;
export const POST = handlers.POST;
