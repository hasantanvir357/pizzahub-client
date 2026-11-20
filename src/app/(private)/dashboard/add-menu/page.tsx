'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthUser, getToken, AuthUser } from '@/lib/auth-session';
import { Loader2, PlusCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FREE_PLAN_MENU_ITEM_LIMIT = 3;
const FREE_PLAN_LIMIT_WARNING =
  'You have reached the Free plan limit (3/3 items). Upgrade to Premium for unlimited menu items.';

export default function AddMenuPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Classic Pizza');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [toppings, setToppings] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vendorItems, setVendorItems] = useState(0);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncUser = () => setUser(getAuthUser());
    syncUser();
    window.addEventListener('auth-change', syncUser);
    return () => window.removeEventListener('auth-change', syncUser);
  }, []);

  const isFreePlanVendor = user?.role === 'vendor' && user?.plan !== 'premium';
  const showFreePlanLimit = isFreePlanVendor && vendorItems >= FREE_PLAN_MENU_ITEM_LIMIT;

  useEffect(() => {
    let ignore = false;
    const fetchVendorItems = async () => {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/vendor/my-items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (!ignore) setVendorItems((data.items || []).length);
      }
    };
    fetchVendorItems();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (showFreePlanLimit) {
      toast.warning(FREE_PLAN_LIMIT_WARNING);
    }
  }, [showFreePlanLimit]);

  const uploadToImgBB = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data?.data?.display_url) throw new Error('Image upload failed');
    return data.data.display_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!imageFile) {
      setError('Please select a pizza photo');
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await uploadToImgBB(imageFile);
      const token = getToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          category,
          price: parseFloat(price),
          description,
          image: imageUrl,
          toppings: toppings
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add pizza');

      toast.success('New pizza submitted for admin approval!');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.refresh();
      router.push('/dashboard/my-menu');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-gray-900">Add New Pizza</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Submit a new item to your kitchen menu (Admin approval required before going live).
      </p>

      {showFreePlanLimit && (
        <Card className="mb-6 overflow-hidden border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
            <p className="text-sm font-bold text-amber-800">{FREE_PLAN_LIMIT_WARNING}</p>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                window.location.href = '/dashboard/subscription';
              }}
              className="rounded-xl bg-[#E20001] hover:bg-[#DB0007] text-white text-xs font-bold"
            >
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-[#E20001]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Pizza Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Smoky BBQ Chicken Feast"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
            >
              <option value="Classic Pizza">Classic Pizza</option>
              <option value="Meat Lovers">Meat Lovers</option>
              <option value="Veggie Delight">Veggie Delight</option>
              <option value="Sides & Drinks">Sides & Drinks</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Base Price ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="14.99"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Toppings (Comma separated)</label>
          <input
            type="text"
            value={toppings}
            onChange={(e) => setToppings(e.target.value)}
            placeholder="Mozzarella, Grilled Chicken, Red Onion, BBQ Sauce"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe crust, sauce, and flavor..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Pizza Photo</label>
          <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 text-xs text-gray-600 hover:border-[#E20001] cursor-pointer">
            <Upload className="w-4 h-4 text-[#E20001]" />
            <span>{imageFile ? imageFile.name : 'Click to upload pizza image'}</span>
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
          className="w-full py-3 rounded-xl bg-[#E20001] hover:bg-[#DB0007] text-white font-bold text-sm pizza-glow flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
          {loading ? 'Uploading & Submitting...' : 'Submit Pizza'}
        </button>
      </form>
    </div>
  );
}
