'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Pizza, Menu as MenuIcon, Loader2 } from 'lucide-react';
import { getAuthUser, getToken, clearAuthSession, AuthUser } from '@/lib/auth-session';
import DashboardSidebar from '@/components/shared/DashboardSidebar';
import { toast } from 'sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  // Session hydration flag: the guard below must never race a still-loading
  // session, otherwise a fast click on "Dashboard" logs the user out.
  const [isLoading, setIsLoading] = useState(true);
  // Mobile drawer visibility is derived from the route it was opened on
  // below, so navigating closes it automatically — no setState in an effect.
  const [sidebar, setSidebar] = useState({ open: false, pathname });
  const sidebarOpen = sidebar.open && sidebar.pathname === pathname;

  useEffect(() => {
    // `syncUser` doubles as the hydration handshake: its first synchronous
    // localStorage read marks `isLoading` false, so the route guard only ever
    // evaluates a fully hydrated session (state updates happen in the
    // callback, not as a direct call in the effect body).
    const syncUser = () => {
      setUser(getAuthUser());
      setIsLoading(false);
    };
    syncUser();
    window.addEventListener('auth-change', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('auth-change', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, [pathname]);

  // Route protection: only after hydration finishes, and only when BOTH the
  // stored user and the auth cookie are missing, do we send the visitor to
  // /sign-in. Valid credentials are never cleared here (read-only checks).
  useEffect(() => {
    if (isLoading) return;
    if (user || getToken()) return;
    router.replace('/sign-in');
  }, [isLoading, user, router]);

  // Close the mobile drawer with Escape.
  useEffect(() => {
    if (!sidebarOpen) return;
    const closeSidebar = () =>
      setSidebar((prev) => (prev.open ? { ...prev, open: false } : prev));
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen]);

  // ---- Session gate -----------------------------------------------------
  // Nothing below may evaluate `user` / `user.role` until hydration has
  // finished (`isLoading === false`) — this is what previously made a fast
  // click on "Dashboard" look like an instant logout for every role.
  // Read-only checks: valid credentials are never cleared on route change.
  const sessionMissing = !isLoading && !user && !getToken();

  if (isLoading || sessionMissing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#FAFAFA] text-gray-900">
        <Loader2 className="w-8 h-8 text-[#E20001] animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Verifying your session...</p>
      </div>
    );
  }

  // Normalize role casing so "admin"/"Admin", "vendor"/"Vendor" and
  // "user"/"customer" all resolve cleanly without case-mismatch redirects.
  const rawRole = (user?.role ?? '').trim().toLowerCase();
  const role: 'admin' | 'vendor' | 'customer' =
    rawRole === 'admin' ? 'admin' : rawRole === 'vendor' ? 'vendor' : 'customer';

  const handleLogout = () => {
    toast.success('Logged out successfully!');
    clearAuthSession();
    // Re-sync server-rendered shells (Navbar role badges, route guards) at once.
    router.refresh();
    setTimeout(() => router.push('/sign-in'), 800);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAFA] text-gray-900">
      {/* Mobile Sticky Top Bar */}
      <header className="md:hidden sticky top-0 z-40 h-14 shrink-0 flex items-center justify-between gap-3 px-4 bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[#E20001] flex items-center justify-center text-white shadow-sm">
            <Pizza className="w-4 h-4" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Pizza<span className="text-[#E20001]">Hub</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E20001] text-white">
            {role} PANEL
          </span>
          <button
            type="button"
            onClick={() => setSidebar({ open: true, pathname })}
            aria-label="Open dashboard menu"
            aria-expanded={sidebarOpen}
            className="w-10 h-10 rounded-xl border border-neutral-200/80 flex items-center justify-center text-gray-700 hover:bg-red-50 hover:text-[#E20001] transition-all duration-300 active:scale-[0.98]"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
          onClick={() => setSidebar((prev) => ({ ...prev, open: false }))}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: fixed column on desktop, slide-over drawer on mobile */}
      <DashboardSidebar
        user={user}
        role={role}
        pathname={pathname}
        open={sidebarOpen}
        onClose={() => setSidebar((prev) => ({ ...prev, open: false }))}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
