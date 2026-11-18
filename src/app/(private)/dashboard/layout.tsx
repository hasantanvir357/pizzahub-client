'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  UtensilsCrossed,
  Users,
  CheckSquare,
  UserCircle,
  LogOut,
  Pizza,
  Home,
} from 'lucide-react';
import { AuthUser, clearAuthSession, getAuthUser } from '@/lib/auth-session';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  // Re-read the session so switching accounts (customer / vendor / admin)
  // always refreshes the user card, panel badge and navigation links.
  const syncUser = useCallback(() => {
    setUser(getAuthUser());
    setReady(true);
  }, []);

  // Same-tab changes dispatch `auth-change`, other tabs notify via `storage`.
  useEffect(() => {
    syncUser();
    window.addEventListener('auth-change', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('auth-change', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, [syncUser]);

  // Route changes can also carry a different account (e.g. after login).
  useEffect(() => {
    syncUser();
  }, [pathname, syncUser]);

  useEffect(() => {
    if (ready && !user) router.push('/sign-in');
  }, [ready, user, router]);

  const handleLogout = () => {
    // `clearAuthSession` dispatches `auth-change`, which syncs the user to
    // null and redirects to /sign-in above.
    clearAuthSession();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#E20001] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    ...(user.role === 'customer' ? [{ label: 'My Orders', href: '/dashboard/my-orders', icon: ShoppingBag }] : []),
    ...(user.role === 'vendor'
      ? [
          { label: 'Add New Pizza', href: '/dashboard/add-menu', icon: PlusCircle },
          { label: 'My Menu Items', href: '/dashboard/my-menu', icon: UtensilsCrossed },
          { label: 'Kitchen Orders', href: '/dashboard/customer-orders', icon: ShoppingBag },
        ]
      : []),
    ...(user.role === 'admin'
      ? [
          { label: 'Approve Menus', href: '/dashboard/manage-menu', icon: CheckSquare },
          { label: 'Manage Users', href: '/dashboard/manage-users', icon: Users },
          { label: 'All Orders', href: '/dashboard/customer-orders', icon: ShoppingBag },
        ]
      : []),
    { label: 'My Profile', href: '/dashboard/profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-red-100 flex flex-col justify-between p-5">
        <div>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-full bg-[#E20001] flex items-center justify-center text-white">
              <Pizza className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-gray-900">
              Pizza<span className="text-[#E20001]">Hub</span>
            </span>
          </Link>

          {/* User Badge */}
          <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-100 mb-6">
            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-[#E20001] text-white text-[10px] font-bold uppercase tracking-wider">
              {user.role} Panel
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active ? 'bg-[#E20001] text-white shadow-xs' : 'text-gray-600 hover:bg-red-50 hover:text-[#E20001]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Links */}
        <div className="pt-6 mt-6 border-t border-gray-100 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
          >
            <Home className="w-4 h-4" /> Back to Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-[#E20001] hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-5 sm:p-8 max-w-6xl">{children}</main>
    </div>
  );
}
