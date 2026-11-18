export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  restaurantName?: string | null;
  image?: string;
}

export function setAuthSession(token: string, user: AuthUser) {
  if (typeof document === 'undefined') return;
  // Save token in Cookie for 7 days (accessible by Next.js proxy & client)
  document.cookie = `pizzahub_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  localStorage.setItem('pizzahub_user', JSON.stringify(user));
  window.dispatchEvent(new Event('auth-change'));
}

export function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )pizzahub_token=([^;]+)'));
  return match ? match[2] : null;
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
  document.cookie = 'pizzahub_token=; path=/; max-age=0';
  // Wipe every client-side store so no credentials or session data survive logout.
  localStorage.clear();
  sessionStorage.clear();
  window.dispatchEvent(new Event('auth-change'));
}
