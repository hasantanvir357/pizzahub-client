'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pizza, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { AuthUser, clearAuthSession, getAuthUser } from '@/lib/auth-session';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => setUser(getAuthUser());
    syncUser();
    window.addEventListener('auth-change', syncUser);
    return () => window.removeEventListener('auth-change', syncUser);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    router.push('/sign-in');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-red-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#E20001] flex items-center justify-center text-white pizza-glow">
            <Pizza className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold text-gray-900">
            Pizza<span className="text-[#E20001]">Hub</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-gray-700">
          <Link href="/" className="hover:text-[#E20001] transition-colors">
            Home
          </Link>
          <Link href="/menu" className="hover:text-[#E20001] transition-colors">
            Browse Menu
          </Link>
          {user && (
            <Link href="/dashboard" className="text-[#E20001] font-bold flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
        </nav>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100">
                <span className="w-6 h-6 rounded-full bg-[#E20001] text-white text-xs font-bold flex items-center justify-center uppercase">
                  {user.name.charAt(0)}
                </span>
                <span className="text-xs font-bold text-gray-800">{user.name}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white text-[#E20001]">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-200 hover:border-[#E20001] hover:text-[#E20001] text-xs font-bold text-gray-700 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/sign-in" className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-[#E20001]">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-5 py-2 rounded-full bg-[#E20001] hover:bg-[#DB0007] text-white text-sm font-bold pizza-glow transition-all"
              >
                Order Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-700">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-3">
          <Link href="/" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold">
            Home
          </Link>
          <Link href="/menu" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold">
            Browse Menu
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-bold text-[#E20001]"
              >
                Dashboard ({user.role})
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full text-left text-sm font-bold text-gray-600"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2 rounded-xl border border-gray-200 text-sm font-bold"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2 rounded-xl bg-[#E20001] text-white text-sm font-bold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
