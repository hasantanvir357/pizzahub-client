'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { setAuthSession } from "@/lib/auth-session";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Never carry credentials over from a previous session.
  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  // Strong password rule: 8+ chars, at least one uppercase and one lowercase.
  const validatePassword = (value: string): string => {
    if (value.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(value)) return 'Password must include at least one uppercase letter (A-Z).';
    if (!/[a-z]/.test(value)) return 'Password must include at least one lowercase letter (a-z).';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationMessage = validatePassword(password);
    if (validationMessage) {
      setPasswordError(validationMessage);
      return;
    }
    setPasswordError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid email or password');

      if (data.token && data.user) {
        setAuthSession(data.token, data.user);
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Welcome Back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to order fresh pizza or manage your kitchen</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-[#E20001]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
          <input
            type="email"
            required
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);
                // Keep showing the inline error until the rule is satisfied.
                if (passwordError) setPasswordError(validatePassword(value));
              }}
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#E20001] ${
                passwordError ? 'border-[#E20001]' : 'border-gray-200'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            Must be 8+ characters with at least one uppercase and one lowercase letter.
          </p>
          {passwordError && (
            <p className="mt-1.5 text-xs font-semibold text-[#E20001]">{passwordError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#E20001] hover:bg-[#DB0007] text-white font-bold text-sm pizza-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-xs text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="font-bold text-[#E20001] hover:underline">
          Create Account
        </Link>
      </p>
    </div>
  );
}
