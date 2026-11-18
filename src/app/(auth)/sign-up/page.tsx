import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <span className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#E20001]">
        PizzaHub
      </span>
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Sign Up</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-500">
        This page is under construction. Please check back soon.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-[#E20001] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#DB0007]"
      >
        Back to Home
      </Link>
    </div>
  );
}
