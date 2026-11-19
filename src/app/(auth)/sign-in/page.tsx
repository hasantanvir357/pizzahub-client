'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { getAuthUser, setAuthSession } from "@/lib/auth-session";
import { authClient } from "@/lib/auth-client";
import { toast } from 'sonner';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Never carry credentials over from a previous session.
  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  // Once better-auth redirects back from Google (?google=success), sync the
  // Google profile with the PizzaHub backend so the backend JWT + user role
  // are saved, then continue to the home page.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const googleError = params.get('error');
    if (googleError) {
      const message = decodeURIComponent(googleError);
      setError(message);
      toast.error(message);
      return;
    }
    if (params.get('google') !== 'success') return;

    let cancelled = false;
    setGoogleLoading(true);

    (async () => {
      try {
        const { data: session, error: sessionError } = await authClient.getSession();
        if (sessionError || !session?.user) {
          throw new Error(sessionError?.message || 'Google session not found. Please try again.');
        }

        // Read the pending Google sign-up intent (if any) before syncing the
        // OAuth profile with the PizzaHub backend.
        let oauthRole: 'customer' | 'vendor' | 'admin' = 'customer';
        let oauthRestaurantName: string | undefined;
        const storedRaw = sessionStorage.getItem('pizzahub_oauth_signup');
        if (storedRaw) {
          try {
            const parsed = JSON.parse(storedRaw);
            if (parsed?.role) oauthRole = parsed.role;
            if (parsed?.restaurantName) oauthRestaurantName = parsed.restaurantName;
          } catch {
            // Ignore malformed intent payloads.
          }
          sessionStorage.removeItem('pizzahub_oauth_signup');
        }

        const currentUser = getAuthUser();
        const role = oauthRole || currentUser?.role || 'customer';
        const restaurantName = oauthRestaurantName || currentUser?.restaurantName || undefined;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            image: session.user.image ?? undefined,
            role,
            restaurantName,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Google sign-in failed');

        if (data.token && data.user) {
          setAuthSession(data.token, data.user);
        }
        if (cancelled) return;
        toast.success('Welcome back! Signing you in...');
        router.replace('/');
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Google sign-in failed';
        setError(message);
        toast.error(message);
        setGoogleLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // "Continue with Google" — better-auth redirects to Google and back to
  // /sign-in?google=success, where the effect above finishes the sync.
  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    // A fresh Google sign-in has no sign-up intent — clear any stale one.
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pizzahub_oauth_signup');
    }

    try {
      const res = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/sign-in?google=success',
      });
      if (res.error) {
        // Log + surface the exact error better-auth returned (message/code)
        // instead of masking it behind a generic failure toast.
        console.error('[Google sign-in] authClient.signIn.social error:', res.error);
        throw new Error(res.error.message || res.error.code || 'Google sign-in failed');
      }
      if (res.data?.url) {
        // Fallback: navigate to Google if the client did not auto-redirect.
        window.location.assign(res.data.url);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      console.error('[Google sign-in] failed:', message);
      setError(message);
      toast.error(message);
      setGoogleLoading(false);
    }
  };

  // Strong password rule: 6+ chars, at least one uppercase and one lowercase.
  const validatePassword = (value: string): string => {
    if (value.length < 6) return 'Password must be at least 6 characters long.';
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
      toast.error(validationMessage);
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
      toast.success('Welcome back! Signing you in...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.replace('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      toast.error(message);
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
              placeholder="At least 6 characters, e.g. Pizza6"
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
            Must be 6+ characters with at least one uppercase and one lowercase letter.
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

      <div className="flex items-center gap-3 my-5">
        <span className="flex-1 h-px bg-gray-200" />
        <span className="text-[11px] font-bold text-gray-400 uppercase">or</span>
        <span className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading || googleLoading}
        className="w-full py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <GoogleIcon className="w-4 h-4" />
        )}
        {googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
      </button>

      <p className="text-center text-xs text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="font-bold text-[#E20001] hover:underline">
          Create Account
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}
