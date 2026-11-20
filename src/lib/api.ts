import { getToken } from '@/lib/auth-session';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

export interface ApiFetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: HeadersInit;
}

/**
 * Central fetch wrapper for the PizzaHub backend API.
 *
 * - Prefixes every path with `NEXT_PUBLIC_API_URL`.
 * - Attaches the bearer token (`pizzahub_token`) from the current session.
 * - Returns the raw `Response` so callers can branch on `res.ok` / status codes.
 *
 * Session handling policy: this wrapper intentionally performs NO automatic
 * session handling. A `401` / `403` (or any other failed) sub-endpoint response
 * is surfaced to the caller untouched — it must never clear the session, wipe
 * storage, or trigger a logout. Failed data requests should degrade gracefully
 * (empty state / error toast) instead of kicking the user out of the panel.
 */
export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  // Deliberately no 401/403 handling here: a failed sub-endpoint request must
  // never log the user out.
  return response;
}
