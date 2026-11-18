'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MenuItem } from '@/components/shared/MenuCard';
import { getToken, getAuthUser, AuthUser } from '@/lib/auth-session';
import { ArrowLeft, CheckCircle2, Loader2, ShoppingBag, Store } from 'lucide-react';
import Link from 'next/link';

export default function MenuDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState<'Regular' | 'Medium' | 'Large'>('Regular');
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncUser = () => setUser(getAuthUser());
    syncUser();
    window.addEventListener('auth-change', syncUser);
    return () => window.removeEventListener('auth-change', syncUser);
  }, []);

  const isVendorOrAdmin = user?.role === 'vendor' || user?.role === 'admin';

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/${id}`);
        if (res.ok) {
          const data = await res.json();
          setItem(data.item);
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchItem();
  }, [id]);

  const multiplier = size === 'Large' ? 1.4 : size === 'Medium' ? 1.2 : 1;
  const totalPrice = item ? (item.price * multiplier * quantity).toFixed(2) : '0.00';

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVendorOrAdmin) return;
    setError('');

    const token = getToken();
    if (!token) {
      router.push('/sign-in');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          menuId: id,
          quantity,
          size,
          phone,
          deliveryAddress,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to place order');

      router.push('/dashboard/orders');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Order failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="h-96 rounded-3xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Pizza Not Found</h2>
        <Link href="/menu" className="inline-block mt-4 text-sm font-bold text-[#E20001]">
          ← Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/menu"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-[#E20001] mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Menu
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        {/* Left: Pizza Image & Info */}
        <div>
          <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
            <span className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-white/95 text-xs font-bold text-gray-800">
              {item.category}
            </span>
          </div>

          <div className="mt-6">
            {item.restaurantName && (
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E20001] mb-1">
                <Store className="w-4 h-4" /> {item.restaurantName}
              </div>
            )}
            <h1 className="text-3xl font-extrabold text-gray-900">{item.name}</h1>
            <p className="text-gray-600 text-sm leading-relaxed mt-3">{item.description}</p>

            {item.toppings && item.toppings.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase text-gray-400 mb-2">Ingredients</p>
                <div className="flex flex-wrap gap-2">
                  {item.toppings.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-[#E20001] text-xs font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Customization & Checkout Form */}
        <form onSubmit={handleOrder} className="bg-[#FFFDFB] p-6 rounded-2xl border border-red-100 space-y-5">
          <div className="flex items-center justify-between border-b border-red-100 pb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Total Amount</p>
              <p className="text-3xl font-extrabold text-[#E20001]">${totalPrice}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">
              30-Min Express Delivery
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-[#E20001]">
              {error}
            </div>
          )}

          {isVendorOrAdmin && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-[#E20001]">
              Vendor and Admin accounts cannot place orders. Please sign in with a Customer account.
            </div>
          )}

          {/* Size Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Select Size</label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['Regular', 'Medium', 'Large'] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSize(s)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    size === s
                      ? 'border-[#E20001] bg-[#E20001] text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-[#E20001]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Quantity</label>
            <input
              type="number"
              min={1}
              max={20}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold focus:outline-none focus:border-[#E20001]"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 17XX-XXXXXX"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
            />
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Delivery Address</label>
            <textarea
              required
              rows={2}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="House, Road, Area, City..."
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#E20001]"
            >
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="Card / Online">Card / Online Payment</option>
            </select>
          </div>

          {!isVendorOrAdmin && (
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-[#E20001] hover:bg-[#DB0007] text-white font-bold text-sm pizza-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
              {submitting ? 'Placing Order...' : `Confirm Order • $${totalPrice}`}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
