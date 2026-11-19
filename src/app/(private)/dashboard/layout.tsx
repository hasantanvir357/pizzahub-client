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
} from 'lucide-react';
import { getAuthUser, clearAuthSession, AuthUser } from '@/lib/auth-session';
import { toast } from 'sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncUser = () => setUser(getAuthUser());
    syncUser();
    window.addEventListener('auth-change', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('auth-change', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, [pathname]);

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
    setTimeout(() => router.push('/sign-in'), 800);
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] text-gray-900">
      {/* Single Fixed Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col justify-between p-5">
        <div>
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-6 px-1">
            <div className="w-9 h-9 rounded-full bg-[#E20001] flex items-center justify-center text-white shadow-sm">
              <Pizza className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Pizza<span className="text-[#E20001]">Hub</span>
            </span>
          </Link>

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
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
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
        <div className="pt-4 border-t border-gray-100 space-y-1.5">
          <Link
            href="/"
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
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
