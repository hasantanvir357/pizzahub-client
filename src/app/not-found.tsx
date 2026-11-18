import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-extrabold text-[#E20001]">404</h1>
      <p className="text-xl font-semibold text-gray-800 mt-2">Page Not Found</p>
      <Link href="/" className="mt-6 px-6 py-2.5 rounded-full bg-[#E20001] text-white text-sm font-semibold">
        Back to Home
      </Link>
    </div>
  );
}
