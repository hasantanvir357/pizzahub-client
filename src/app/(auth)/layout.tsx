import Link from 'next/link';
import { Pizza } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 py-12 bg-gray-950">
      {/* Background Pizza Image & Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1800&auto=format&fit=crop')`,
        }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/60 to-black/80" />

      {/* Brand Logo */}
      <Link href="/" className="relative z-10 flex items-center gap-2.5 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#E20001] flex items-center justify-center text-white pizza-glow">
          <Pizza className="w-6 h-6" />
        </div>
        <span className="text-2xl font-extrabold text-white">
          Pizza<span className="text-[#E20001]">Hub</span>
        </span>
      </Link>

      {/* Auth Card Container */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-7 sm:p-8 border border-gray-100">
        {children}
      </div>
    </div>
  );
}
