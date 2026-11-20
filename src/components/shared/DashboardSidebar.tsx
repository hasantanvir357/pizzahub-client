'use client';

import Link from 'next/link';
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
  Heart,
  X,
} from 'lucide-react';
import type { AuthUser } from '@/lib/auth-session';
import { getAvatarUrl, handleAvatarError } from '@/lib/avatar';

export type DashboardRole = 'admin' | 'vendor' | 'customer';

interface DashboardSidebarProps {
  user: AuthUser | null;
  role: DashboardRole;
  pathname: string;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function DashboardSidebar({
  user,
  role,
  pathname,
  open,
  onClose,
  onLogout,
}: DashboardSidebarProps) {
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
            { label: 'My Favorites', href: '/dashboard/favorites', icon: Heart },
            { label: 'My Profile', href: '/dashboard/profile', icon: UserCircle },
          ];

  return (
    <aside
      className={`w-64 shrink-0 bg-white border-r border-neutral-200/80 flex flex-col justify-between p-5 transition-transform duration-300 ease-out fixed inset-y-0 left-0 z-50 md:static md:z-auto md:translate-x-0 md:transition-none ${
        open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      <div>
        {/* Brand Logo (mobile drawer only — the top bar owns branding on small screens) */}
        <div className="flex items-center justify-between mb-6 px-1">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-9 h-9 rounded-full bg-[#E20001] flex items-center justify-center text-white shadow-sm">
              <Pizza className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Pizza<span className="text-[#E20001]">Hub</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dashboard menu"
            className="md:hidden w-9 h-9 rounded-xl border border-neutral-200/80 flex items-center justify-center text-gray-500 hover:text-[#E20001] transition-all duration-300 active:scale-[0.98]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="relative w-10 h-10 rounded-full overflow-hidden border border-red-200 bg-[#E20001] shrink-0">
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
              <img
                src={getAvatarUrl(user)}
                alt={user?.name || 'User'}
                onError={(e) => handleAvatarError(e, user?.role)}
                className="relative w-full h-full object-cover"
              />
            </span>
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
                onClick={onClose}
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
          onClick={onClose}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Back to Website</span>
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#E20001] hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
