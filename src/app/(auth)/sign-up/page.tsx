'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Store, Upload, Loader2 } from 'lucide-react';
import { setAuthSession } from "@/lib/auth-session";

export default function SignUpPage() {
  const router = useRouter();
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Strong password rule: 8+ chars, at least one uppercase and one lowercase.
  const validatePassword = (value: string): string => {
    if (value.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(value)) return 'Password must include at least one uppercase letter (A-Z).';
    if (!/[a-z]/.test(value)) return 'Password must include at least one lowercase letter (a-z).';
    return '';
  };

  const uploadToImgBB = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data?.data?.display_url || '';
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
      let avatarUrl = '';
      if (imageFile && process.env.NEXT_PUBLIC_IMGBB_API_KEY) {
        avatarUrl = await uploadToImgBB(imageFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          restaurantName: role === 'vendor' ? restaurantName : undefined,
          image: avatarUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      if (data.token && data.user) {
        setAuthSession(data.token, data.user);
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-5">
        <h1 className="text-2xl font-extrabold text-gray-900">Create Account</h1>
        <p className="text-sm text-gray-500 mt-1">Join PizzaHub as a customer or restaurant partner</p>
      </div>

      {/* Role Selector */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          type="button"
          onClick={() => setRole('customer')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
            role === 'customer'
              ? 'border-[#E20001] bg-red-50 text-[#E20001]'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <User className="w-4 h-4" />
          Customer
        </button>
        <button
          type="button"
          onClick={() => setRole('vendor')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
            role === 'vendor'
              ? 'border-[#E20001] bg-red-50 text-[#E20001]'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Store className="w-4 h-4" />
          Vendor (Kitchen)
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-[#E20001]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tanvir Hasan"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
          />
        </div>

        {role === 'vendor' && (
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Restaurant / Pizzeria Name</label>
            <input
              type="text"
              required
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Napoli Wood-Fired Pizza"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => {
              const value = e.target.value;
              setPassword(value);
              // Keep showing the inline error until the rule is satisfied.
              if (passwordError) setPasswordError(validatePassword(value));
            }}
            placeholder="At least 8 characters, e.g. PizzaHub26"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#E20001] ${
              passwordError ? 'border-[#E20001]' : 'border-gray-200'
            }`}
          />
          <p className="text-[11px] text-gray-500 mt-1">
            Must be 8+ characters with at least one uppercase and one lowercase letter.
          </p>
          {passwordError && (
            <p className="mt-1.5 text-xs font-semibold text-[#E20001]">{passwordError}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Profile Photo (Optional)</label>
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 text-xs text-gray-500 hover:border-[#E20001] cursor-pointer">
            <Upload className="w-4 h-4 text-[#E20001]" />
            <span className="truncate">{imageFile ? imageFile.name : 'Upload image (PNG, JPG)'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#E20001] hover:bg-[#DB0007] text-white font-bold text-sm pizza-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-xs text-gray-500 mt-5">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-bold text-[#E20001] hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
