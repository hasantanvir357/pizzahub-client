import Link from 'next/link';
import { Pizza, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-red-50 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-amber-50 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-full bg-[#E20001] flex items-center justify-center text-white">
            <Pizza className="w-5 h-5" />
          </span>
          <span className="text-2xl font-extrabold text-gray-900">
            Pizza<span className="text-[#E20001]">Hub</span>
          </span>
        </Link>

        {/* Pizza Slice Illustration */}
        <div className="mt-10 flex items-center justify-center" aria-hidden="true">
          <div className="relative">
            <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="96" fill="#FFF7ED" />
              <path d="M100 168C100 168 40 128 40 86C40 62 68 44 100 44C132 44 160 62 160 86C160 128 100 168 100 168Z" fill="#E20001" />
              <path d="M100 152C100 152 54 118 54 86C54 68 76 56 100 56C124 56 146 68 146 86C146 118 100 152 100 152Z" fill="#FDE68A" />
              <circle cx="86" cy="86" r="9" fill="#E20001" />
              <circle cx="116" cy="98" r="8" fill="#E20001" />
              <circle cx="104" cy="70" r="7" fill="#E20001" />
              <circle cx="122" cy="118" r="5" fill="#E20001" />
              <path d="M52 96C50 118 100 156 100 156" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" fill="none" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-extrabold text-[#E20001] drop-shadow-sm">404</span>
            </span>
          </div>
        </div>

        {/* Message */}
        <h1 className="mt-8 text-3xl font-extrabold text-gray-900">Page Not Found</h1>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          Looks like this slice has been taken off the menu. The page you are looking for
          doesn&apos;t exist or may have moved to a fresh location.
        </p>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            render={
              <Link href="/" className="inline-flex items-center justify-center" />
            }
            size="lg"
            className="bg-[#E20001] text-white hover:bg-[#DB0007] rounded-xl px-6 font-bold"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
          <Button
            render={
              <Link href="/menu" className="inline-flex items-center justify-center" />
            }
            variant="outline"
            size="lg"
            className="rounded-xl px-6 font-bold text-gray-700 border-gray-200 hover:text-[#E20001] hover:border-[#E20001]"
          >
            Browse Menu
          </Button>
        </div>
      </div>
    </div>
  );
}
