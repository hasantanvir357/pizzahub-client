'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  UtensilsCrossed,
  ClipboardList,
  CheckSquare,
  Users,
  ShieldBan,
  UserCircle,
  Home,
  LogOut,
  Pizza,
  CreditCard,
  ReceiptText,
  Menu as MenuIcon,
  X,
  Loader2,
} from 'lucide-react';
import { getAuthUser, getToken, clearAuthSession, AuthUser } from '@/lib/auth-session';
import { toast } from 'sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  // Session hydration flag: the guard below must never race a still-loading
  // session, otherwise a fast click on "Dashboard" logs the user out.
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => setUser(getAuthUser());
    // First sync reads localStorage synchronously — the session is hydrated.
    syncUser();
    setIsLoading(false);
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

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close the mobile drawer with Escape.
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen]);

  const role = user?.role || 'customer';

  const navItems =
    role === 'admin'
      ? [
          { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Approve Menus', href: '/dashboard/manage-menu', icon: CheckSquare },
          { label: 'Manage Users', href: '/dashboard/manage-users', icon: Users },
          { label: 'Blocked Users', href: '/dashboard/blocked-users', icon: ShieldBan },
          { label: 'All Orders', href: '/dashboard/customer-orders', icon: ClipboardList },
          { label: 'Transactions', href: '/dashboard/transactions', icon: ReceiptText },
          { label: 'My Profile', href: '/dashboard/profile', icon: UserCircle },
        ]
      : role === 'vendor'
        ? [
            { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
            { label: 'Add New Pizza', href: '/dashboard/add-menu', icon: PlusCircle },
            { label: 'My Menu Items', href: '/dashboard/my-menu', icon: UtensilsCrossed },
            { label: 'Kitchen Orders', href: '/dashboard/customer-orders', icon: ClipboardList },
            { label: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
            { label: 'My Profile', href: '/dashboard/profile', icon: UserCircle },
          ]
        : [
            { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
            { label: 'My Orders', href: '/dashboard/my-orders', icon: ShoppingBag },
            { label: 'My Profile', href: '/dashboard/profile', icon: UserCircle },
          ];

  const handleLogout = () => {
    toast.success('Logged out successfully!');
    clearAuthSession();
    // Re-sync server-rendered shells (Navbar role badges, route guards) at once.
    router.refresh();
    setTimeout(() => router.push('/sign-in'), 800);
  };

  // While the session hydrates — or while a genuine missing-session redirect
  // is in flight — show a clean spinner instead of flashing the guest UI.
  const sessionMissing = !isLoading && !user && !getToken();

  if (isLoading || sessionMissing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#FAFAFA] text-gray-900">
        <Loader2 className="w-8 h-8 text-[#E20001] animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Verifying your session...</p>
      </div>
    );
  }

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
            onClick={() => setSidebarOpen(true)}
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
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: fixed column on desktop, slide-over drawer on mobile */}
      <aside
        className={`w-64 shrink-0 bg-white border-r border-neutral-200/80 flex flex-col justify-between p-5 transition-transform duration-300 ease-out fixed inset-y-0 left-0 z-50 md:static md:z-auto md:translate-x-0 md:transition-none ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo (mobile drawer only — the top bar owns branding on small screens) */}
          <div className="flex items-center justify-between mb-6 px-1">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
              <div className="w-9 h-9 rounded-full bg-[#E20001] flex items-center justify-center text-white shadow-sm">
                <Pizza className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                Pizza<span className="text-[#E20001]">Hub</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close dashboard menu"
              className="md:hidden w-9 h-9 rounded-xl border border-neutral-200/80 flex items-center justify-center text-gray-500 hover:text-[#E20001] transition-all duration-300 active:scale-[0.98]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Info Card */}
          <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-red-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#E20001] text-white font-bold flex items-center justify-center text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
            <span className="mt-3 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E20001] text-white">
              {role} PANEL
            </span>
          </div>

          {/* Role-Specific Navigation */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-[0.98] ${
                    isActive
                      ? 'bg-[#E20001] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-red-50 hover:text-[#E20001]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-neutral-200/80 space-y-1.5">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Back to Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#E20001] hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
