'use client';

import { useState } from 'react';
import { getAuthUser, getToken, setAuthSession, AuthUser } from '@/lib/auth-session';

export default function ProfilePage() {
  const [user] = useState<AuthUser | null>(() => getAuthUser());
  const [name, setName] = useState(user?.name ?? '');
  const [restaurantName, setRestaurantName] = useState(user?.restaurantName ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const body: { name: string; restaurantName?: string } = { name };
    if (user?.role === 'vendor') body.restaurantName = restaurantName;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok && user) {
      const data = await res.json();
      const updated: AuthUser = { ...user, ...data.user, name, ...(user.role === 'vendor' ? { restaurantName } : {}) };
      const token = getToken();
      if (token) setAuthSession(token, updated);
      setMessage('Profile updated successfully.');
    } else {
      setMessage('Failed to update profile. Please try again.');
    }
    setSaving(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Profile Settings</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div>
          <label htmlFor="name" className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#E20001] focus:outline-none"
          />
        </div>

        {user.role === 'vendor' && (
          <div>
            <label htmlFor="restaurantName" className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
              Restaurant Name
            </label>
            <input
              id="restaurantName"
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#E20001] focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Email</label>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>

        {message && <p className="text-sm font-bold text-green-600">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-[#E20001] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#DB0007] transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
