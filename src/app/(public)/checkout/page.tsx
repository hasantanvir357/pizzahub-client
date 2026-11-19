'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingBag,
  Truck,
  CreditCard,
  Loader2,
  User,
  Phone,
  MapPin,
  StickyNote,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getAuthUser, getToken, type AuthUser } from '@/lib/auth-session';
import { toast } from 'sonner';

function formatPrice(value: number) {
  return `$${Number(value).toFixed(2)}`;
}

function CheckoutPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, removeItem, clearCart, itemCount } = useCart();

  const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());
  const [authChecked, setAuthChecked] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [submitting, setSubmitting] = useState(false);

  const mode: 'all' | 'single' = searchParams.get('mode') === 'single' ? 'single' : 'all';
  const singleId = searchParams.get('id');
  const singleSize = searchParams.get('size') || 'Regular';

  useEffect(() => {
    const syncUser = () => setUser(getAuthUser());
    syncUser();
    window.addEventListener('auth-change', syncUser);
    return () => window.removeEventListener('auth-change', syncUser);
  }, []);

  const guardedRef = useRef(false);
  useEffect(() => {
    if (guardedRef.current) return;

    const token = getToken();
    if (!token || !user) {
      router.replace('/sign-in');
      return;
    }
    if (user.role !== 'customer') {
      toast.warning('Only Customer accounts can place orders.');
      router.replace('/');
      return;
    }

    guardedRef.current = true;
    if (!fullName) setFullName(user.name || '');
    setAuthChecked(true);
  }, [user, router, fullName]);

  const checkoutItems = useMemo(() => {
    if (mode === 'single') {
      const match = items.find(
        (entry) => entry.menuItemId === singleId && (entry.size || 'Regular') === singleSize
      );
      return match ? [match] : [];
    }
    return items;
  }, [mode, singleId, singleSize, items]);

  const totalItems = checkoutItems.reduce((sum, entry) => sum + entry.quantity, 0);
  const grandTotal = checkoutItems.reduce(
    (sum, entry) => sum + Number((entry.price * entry.quantity).toFixed(2)),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || checkoutItems.length === 0) return;

    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    if (!trimmedPhone || trimmedPhone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid phone number, e.g. +880 17XX-XXXXXX.');
      return;
    }
    if (!trimmedAddress) {
      toast.error('Please provide a delivery address.');
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace('/sign-in');
      return;
    }

    const customerName = fullName.trim();
    const customerEmail = user?.email ?? '';
    setSubmitting(true);
    try {
      const responses = await Promise.all(
        checkoutItems.map((entry) => {
          const lineTotal = Number((entry.price * entry.quantity).toFixed(2));
          return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              menuId: entry.menuItemId,
              pizzaName: entry.name,
              size: entry.size || 'Regular',
              quantity: entry.quantity,
              totalPrice: lineTotal,
              customerName,
              customerEmail,
              phone: trimmedPhone,
              address: trimmedAddress,
              deliveryNotes: deliveryNotes.trim(),
              paymentMethod,
            }),
          });
        })
      );

      const failed = responses.find((res) => !res.ok);
      if (failed) {
        const data = await failed.json().catch(() => ({} as { message?: string }));
        toast.error(data.message || 'Failed to place order');
        return;
      }

      if (mode === 'single') {
        const entry = checkoutItems[0];
        removeItem(entry.menuItemId, entry.size);
      } else {
        clearCart();
      }

      toast.success('Order placed successfully!');
      router.push('/dashboard/my-orders');
    } catch {
      toast.error('Network error while placing order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="w-8 h-8 text-[#E20001] animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Checking your account...</p>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-[#E20001]" />
        </div>
        <p className="text-lg font-extrabold text-gray-900 mb-1">Nothing to check out.</p>
        <p className="text-sm text-gray-500 mb-6">
          {mode === 'single'
            ? 'This item is no longer in your cart.'
            : 'Your cart is empty. Add some delicious pizza first.'}
        </p>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E20001] hover:bg-[#DB0007] text-white text-sm font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link
        href="/menu"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#E20001] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Menu</span>
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 rounded-xl bg-red-50 text-[#E20001] flex items-center justify-center">
          <ShoppingBag className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Checkout</h1>
          <p className="text-xs font-semibold text-gray-500">
            {mode === 'single'
              ? 'Completing a single item order'
              : `Completing your order (${totalItems} ${totalItems === 1 ? 'Item' : 'Items'})`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Delivery & Payment */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 text-[#E20001]" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Delivery &amp; Payment Details
            </p>
          </div>

          <div>
            <label htmlFor="checkout-name" className="block text-xs font-bold text-gray-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="checkout-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="checkout-phone" className="block text-xs font-bold text-gray-700 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="checkout-phone"
                type="tel"
                placeholder="+880 17XX-XXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="checkout-address" className="block text-xs font-bold text-gray-700 mb-1.5">
              Delivery Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <textarea
                id="checkout-address"
                rows={2}
                placeholder="House, Road, Area, City..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#E20001] resize-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="checkout-notes" className="block text-xs font-bold text-gray-700 mb-1.5">
              Delivery Notes <span className="font-medium text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <StickyNote className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <textarea
                id="checkout-notes"
                rows={2}
                placeholder="e.g. Leave at the gate, call before arrival"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#E20001] resize-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="checkout-payment" className="block text-xs font-bold text-gray-700 mb-1.5">
              Payment Method
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                id="checkout-payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#E20001] appearance-none"
              >
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="Card on Delivery">Card on Delivery</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4 md:sticky md:top-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Order Summary</p>

          <ul className="space-y-3">
            {checkoutItems.map((entry) => (
              <li
                key={`${entry.menuItemId}:${entry.size || 'Regular'}`}
                className="flex items-start gap-3 p-3 rounded-2xl border border-gray-100 bg-[#FAFAFA]"
              >
                {entry.image ? (
                  <Image
                    src={entry.image}
                    alt={entry.name}
                    width={48}
                    height={48}
                    unoptimized
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-red-50 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{entry.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {entry.size || 'Regular'} size · Qty {entry.quantity}
                  </p>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">
                    {formatPrice(entry.price)} × {entry.quantity}
                  </p>
                </div>
                <p className="text-sm font-extrabold text-gray-900 shrink-0">
                  {formatPrice(entry.price * entry.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-700">Subtotal</p>
              <p className="text-sm font-extrabold text-gray-900">{formatPrice(grandTotal)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-700">Delivery Fee</p>
              <p className="text-sm font-extrabold text-emerald-600">Free</p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <p className="text-sm font-bold text-gray-700">Grand Total</p>
              <p className="text-2xl font-extrabold text-[#E20001]">{formatPrice(grandTotal)}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm opacity-100 transition-colors disabled:opacity-100"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
          </button>

          <p className="text-[11px] text-gray-400 text-center">
            Delivery is on the house. Orders are confirmed within minutes.
          </p>
        </div>
      </form>

      {/* Contextual note for single-item checkout so the full cart stays intact */}
      {mode === 'single' && itemCount > 1 && (
        <p className="mt-4 text-center text-xs font-semibold text-gray-400">
          Remaining cart items stay in your cart for a later order.
        </p>
      )}
      {mode === 'all' && itemCount === totalItems && (
        <p className="mt-4 text-center text-xs font-semibold text-gray-400">
          Placing this order clears all {totalItems} {totalItems === 1 ? 'item' : 'items'} from your cart.
        </p>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-8 h-8 text-[#E20001] animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Preparing checkout...</p>
        </div>
      }
    >
      <CheckoutPageInner />
    </Suspense>
  );
}
