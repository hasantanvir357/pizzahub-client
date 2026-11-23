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
/** Mirror key used only when the browser refuses the cookie write (see setAuthSession). */
const TOKEN_KEY = 'pizzahub_token';

/** Read the auth cookie only (no localStorage fallback). */
function getCookieToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${TOKEN_COOKIE}=([^;]+)`));
  return match ? match[2] : null;
}

export function setAuthSession(token: string, user: AuthUser) {
  if (typeof document === 'undefined') return;
 
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

  if (!getCookieToken()) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
     
    }
  }
  localStorage.setItem('pizzahub_user', JSON.stringify(user));
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
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
  // Wipe every client-side store so no credentials or session data survive logout.
  localStorage.clear();
  sessionStorage.clear();
  window.dispatchEvent(new Event('auth-change'));
}
