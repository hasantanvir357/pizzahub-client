export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  restaurantName?: string | null;
  image?: string;
  /** Alternative avatar field some API payloads return. */
  avatar?: string | null;
  plan?: 'free' | 'premium';
}

const TOKEN_COOKIE = 'pizzahub_token';
/** Fallback key for when the browser drops or blocks the auth cookie. */
const TOKEN_KEY = 'pizzahub_token';
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7;
const COOKIE_SECURITY = process.env.NODE_ENV === 'production' ? '; Secure' : '';

/** Read the auth cookie only (no localStorage fallback). */
function getCookieToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${TOKEN_COOKIE}=([^;]+)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[2]);
  } catch {
    return match[2];
  }
}

export function setAuthSession(token: string, user: AuthUser) {
  if (typeof document === 'undefined') return;

  // The cookie is written site-wide so it survives navigation between public
  // and dashboard routes. Keep a localStorage mirror too: if the browser
  // refuses the cookie, API calls can still send the bearer token.
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${TOKEN_MAX_AGE}; SameSite=Lax${COOKIE_SECURITY}`;
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('pizzahub_user', JSON.stringify(user));
  } catch {
    // Storage may be disabled; the cookie remains authoritative.
  }
  window.dispatchEvent(new Event('auth-change'));
}

export function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const cookieToken = getCookieToken();
  if (cookieToken) return cookieToken;

  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('pizzahub_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (typeof document === 'undefined') return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax${COOKIE_SECURITY}`;
  // Wipe every client-side store so no credentials or session data survive logout.
  localStorage.clear();
  sessionStorage.clear();
  window.dispatchEvent(new Event('auth-change'));
}
