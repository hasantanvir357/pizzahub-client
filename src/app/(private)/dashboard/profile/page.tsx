'use client';

import { useState } from 'react';
import { getAuthUser, getToken, setAuthSession, AuthUser } from '@/lib/auth-session';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [user] = useState<AuthUser | null>(() => getAuthUser());
  const [name, setName] = useState(user?.name ?? '');
  const [restaurantName, setRestaurantName] = useState(user?.restaurantName ?? '');
  const [image, setImage] = useState<string | null>(user?.image ?? null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Downscale any image on a canvas so we always have a clean, lightweight
  // 256×256 JPEG data URL — even when ImgBB is unavailable or blocked.
  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        try {
          const MAX = 256;
          const canvas = document.createElement('canvas');
          canvas.width = MAX;
          canvas.height = MAX;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas unavailable');

          // Cover-fit: crop to a centered square so avatars never stretch.
          const scale = Math.max(MAX / img.width, MAX / img.height);
          const drawW = img.width * scale;
          const drawH = img.height * scale;
          ctx.drawImage(img, (MAX - drawW) / 2, (MAX - drawH) / 2, drawW, drawH);
          URL.revokeObjectURL(objectUrl);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Could not read the selected image'));
      };
      img.src = objectUrl;
    });

  const uploadToImgBB = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`https://api.imgbb.com/1.0?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    const url: string | undefined = data?.data?.url;
    if (!res.ok || !url) throw new Error('Image upload failed');
    return url;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage('');
    setError('');
    try {
      // 1. Always compress locally first → instant preview + reliable fallback.
      const dataUrl = await compressImage(file);
      setImage(dataUrl);
      setMessage('Photo ready — press "Save Changes" to apply it.');

      // 2. Best-effort ImgBB upload when a key is configured.
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (apiKey) {
        try {
          const url = await uploadToImgBB(file);
          setImage(url);
          setMessage('Photo uploaded — press "Save Changes" to apply it.');
        } catch {
          // Keep the locally compressed data URL; never surface an error.
        }
      }
      toast.success('Profile photo ready!');
    } catch {
      setError('Could not read that image. Please try a different PNG or JPG.');
      toast.error('Could not read that image. Please try a different PNG or JPG.');
    } finally {
      setUploading(false);
      // Allow re-selecting the same file later.
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const body: { name: string; restaurantName?: string; image?: string } = { name };
    if (user?.role === 'vendor') body.restaurantName = restaurantName;
    if (image) body.image = image;

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
      const updated: AuthUser = {
        ...user,
        ...data.user,
        name,
        ...(user.role === 'vendor' ? { restaurantName } : {}),
        ...(image ? { image } : {}),
      };
      const token = getToken();
      if (token) setAuthSession(token, updated);
      setMessage('Profile updated successfully.');
      toast.success('Profile updated successfully!');
    } else {
      setError('Failed to update profile. Please try again.');
      toast.error('Failed to update profile. Please try again.');
    }
    setSaving(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Profile Settings</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        {/* Avatar Preview & Optional Profile Photo */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-red-50 border border-red-100 flex items-center justify-center shrink-0 transition-all duration-300">
            {image ? (
              <img src={image} alt={name || 'Profile photo'} className="w-full h-full object-cover" />
            ) : (
              <span className="w-10 h-10 rounded-full bg-[#E20001] text-white text-lg font-bold flex items-center justify-center">
                {user?.name?.charAt(0) ?? '?'}
              </span>
            )}
          </div>
          <div>
            <label htmlFor="profile-photo" className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
              Optional Profile Photo
            </label>
            <input
              id="profile-photo"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploading}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#E20001] file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-[#DB0007] disabled:opacity-60"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              {uploading ? 'Optimizing photo…' : 'PNG or JPG — auto-resized to 256×256 before saving.'}
            </p>
          </div>
        </div>

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

        {error && <p className="text-sm font-bold text-[#E20001]">{error}</p>}
        {message && <p className="text-sm font-bold text-green-600">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-[#E20001] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#DB0007] transition-all duration-300 hover:shadow-lg hover:shadow-red-600/30 active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
