'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Pizza,
  Menu,
  X,
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown,
  ShoppingBag,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';

type UserRole = 'customer' | 'vendor' | 'admin' | null;

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [user, setUser] = useState<{
    name: string;
    email: string;
    image?: string;
    role: UserRole;
  } | null>(null);

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    setUser(null);
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-[#E20001] flex items-center justify-center text-white pizza-glow transition-transform group-hover:scale-105">
              <Pizza className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">
              Pizza<span className="text-[#E20001]">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation (Role-Based) */}
          <nav className="hidden md:flex items-center gap-2 bg-[#FFF8F6] px-3 py-1.5 rounded-full border border-red-100">
            <Link
              href="/"
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                isActive('/') ? 'bg-[#E20001] text-white shadow-sm' : 'text-gray-700 hover:text-[#E20001]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/menu"
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                isActive('/menu') ? 'bg-[#E20001] text-white shadow-sm' : 'text-gray-700 hover:text-[#E20001]'
              }`}
            >
              Browse Menu
            </Link>

            {/* Role-Specific Quick Links */}
            {user?.role === 'customer' && (
              <Link
                href="/dashboard/my-orders"
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  isActive('/dashboard/my-orders')
                    ? 'bg-[#E20001] text-white shadow-sm'
                    : 'text-gray-700 hover:text-[#E20001]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                My Orders
              </Link>
            )}

            {user?.role === 'vendor' && (
              <Link
                href="/dashboard/add-menu"
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  isActive('/dashboard/add-menu')
                    ? 'bg-[#E20001] text-white shadow-sm'
                    : 'text-gray-700 hover:text-[#E20001]'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Add Menu
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                href="/dashboard/manage-menu"
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  isActive('/dashboard/manage-menu')
                    ? 'bg-[#E20001] text-white shadow-sm'
                    : 'text-gray-700 hover:text-[#E20001]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Review Menus
              </Link>
            )}

            {user && (
              <Link
                href="/dashboard"
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  pathname.startsWith('/dashboard') &&
                  !isActive('/dashboard/my-orders') &&
                  !isActive('/dashboard/add-menu') &&
                  !isActive('/dashboard/manage-menu')
                    ? 'bg-[#E20001] text-white shadow-sm'
                    : 'text-gray-700 hover:text-[#E20001]'
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Right Auth / Profile Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <Link
                  href="/sign-in"
                  className="px-5 py-2.5 text-sm font-semibold text-gray-800 hover:text-[#E20001] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-6 py-2.5 rounded-full text-sm font-semibold bg-[#E20001] hover:bg-[#DB0007] text-white pizza-glow transition-all"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:border-[#E20001]/40 bg-white transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E20001] text-white flex items-center justify-center font-bold text-sm uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-900 leading-none">{user.name}</p>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#E20001]">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-[#E20001] font-medium"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-[#E20001] font-medium"
                    >
                      <User className="w-4 h-4" />
                      Profile Settings
                    </Link>
                    <hr className="my-1.5 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-semibold text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-[#E20001]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-red-50 hover:text-[#E20001]"
          >
            Home
          </Link>
          <Link
            href="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-red-50 hover:text-[#E20001]"
          >
            Browse Menu
          </Link>

          {user && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-red-50 hover:text-[#E20001]"
              >
                Dashboard ({user.role})
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-red-50 hover:text-[#E20001]"
              >
                Profile Settings
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {!user ? (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full bg-[#E20001] text-white text-sm font-semibold"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full text-center py-2.5 rounded-full bg-red-50 text-[#E20001] text-sm font-semibold"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
