'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Pizza, LayoutDashboard, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { AuthUser, clearAuthSession, getAuthUser } from '@/lib/auth-session';
import { toast } from 'sonner';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => setUser(getAuthUser());
    syncUser();
    window.addEventListener('auth-change', syncUser);
    return () => window.removeEventListener('auth-change', syncUser);
  }, []);

  // Close the avatar dropdown on outside click.
  useEffect(() => {
    if (!userMenuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-user-menu]')) return;
      setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [userMenuOpen]);

  // Close the avatar dropdown whenever the route changes.
  useEffect(() => {
    setUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    toast.success('Logged out successfully!');
    clearAuthSession();
    setUser(null);
    setTimeout(() => router.push('/sign-in'), 800);
  };

  const userInitial = user?.name?.charAt(0) ?? '?';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-red-100 animate-from-top">
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
          <Link href="/" className="hover:text-[#E2001] transition-colors">
            Home
          </Link>
          <Link href="/menu" className="hover:text-[#E2001] transition-colors">
            Browse Menu
          </Link>
        </nav>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative" data-user-menu>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full bg-red-50 border border-red-100 hover:border-[#E20001]/60 transition-all duration-300"
              >
                {user.image ? (
                  <span className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#E20001]/30 shrink-0">
                    <Image src={user.image} alt={user.name} width={32} height={32} className="w-full h-full object-cover" />
                  </span>
                ) : (
                  <span className="w-8 h-8 rounded-full bg-[#E20001] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {userInitial}
                  </span>
                )}
                <span className="text-xs font-bold text-gray-800 max-w-[140px] truncate">{user.name}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#E2001] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50 animate-from-top transition-all duration-200"
                >
                  {/* Dropdown Header */}
                  <div className="px-4 py-3 bg-red-50/70 border-b border-red-100">
                    <p className="text-sm font-extrabold text-gray-900 truncate">{user.name}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#E20001] text-white text-[10px] font-bold uppercase tracking-wider">
                      {user.role.toUpperCase()}
                    </span>
                  </div>

                  {/* Dropdown Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-[#E2001] transition-all duration-200"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#E2001] hover:bg-red-50 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/sign-in" className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-[#E2001]">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-5 py-2 rounded-full bg-[#E2001] hover:bg-[#DB0007] text-white text-sm font-bold pizza-glow transition-all"
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
                className="block text-sm font-bold text-[#E2001]"
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
                className="flex-1 text-center py-2 rounded-xl bg-[#E2001] text-white text-sm font-bold"
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
