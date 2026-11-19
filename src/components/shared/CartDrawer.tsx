'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart, type CartLineItem } from '@/context/CartContext';
import { getToken } from '@/lib/auth-session';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, clearCart, itemCount, subtotal } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const placeOrder = async (item: CartLineItem) => {
    const token = getToken();
    if (!token) throw new Error('Please sign in to place an order.');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        menuItemId: item.menuItemId,
        size: item.size || 'Regular',
        quantity: item.quantity,
        totalPrice: Number((item.price * item.quantity).toFixed(2)),
        phone: '',
        customerPhone: '',
        address: '',
        deliveryAddress: '',
        paymentMethod: 'Cash on Delivery',
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to place order');
    return data;
  };

  const handleCheckoutItem = async (item: CartLineItem) => {
    setSubmitting(true);
    try {
      await placeOrder(item);
      removeItem(item.menuItemId, item.size);
      toast.success('Order placed successfully!');
      closeCart();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to place order';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckoutAll = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      await Promise.all(items.map((item) => placeOrder(item)));
      clearCart();
      toast.success('Order placed successfully!');
      closeCart();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to place order';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (value: number) => `$${Number(value).toFixed(2)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black/50"
            onClick={closeCart}
            data-testid="cart-overlay"
          />

          {/* Slide-over panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#E20001]" />
                Your Cart
                {itemCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#E2001] text-xs font-bold">
                    {itemCount}
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="p-2 rounded-full text-gray-400 hover:text-[#E2001] hover:bg-red-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-[#E2001]" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Your cart is empty.</p>
                  <p className="text-xs text-gray-500">Add some delicious pizza to get started.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <li key={`${item.menuItemId}:${item.size || 'Regular'}`} className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={48}
                            height={48}
                            unoptimized
                            className="w-12 h-12 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                          {item.size && <p className="text-xs text-gray-500 mt-0.5">{item.size} size</p>}
                          <p className="text-xs font-bold text-[#E2001] mt-1">{formatPrice(item.price)}</p>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity controls */}
                            <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-2 py-1">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                onClick={() => updateQuantity(item.menuItemId, item.size, item.quantity - 1)}
                                className="p-1 rounded-lg text-gray-500 hover:text-[#E2001] hover:bg-red-50 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-bold text-gray-900 min-w-4 text-center">{item.quantity}</span>
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                onClick={() => updateQuantity(item.menuItemId, item.size, item.quantity + 1)}
                                className="p-1 rounded-lg text-gray-500 hover:text-[#E2001] hover:bg-red-50 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              aria-label={`Remove ${item.name} from cart`}
                              onClick={() => removeItem(item.menuItemId, item.size)}
                              className="p-2 rounded-lg text-gray-400 hover:text-[#E2001] hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between">
                          <p className="text-sm font-extrabold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                          <button
                            type="button"
                            onClick={() => handleCheckoutItem(item)}
                            disabled={submitting}
                            className="mt-2 text-[11px] font-bold uppercase tracking-wide text-[#E2001] hover:text-[#DB0007] disabled:opacity-60"
                          >
                            Checkout This Item
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-gray-700">Total</p>
                  <p className="text-lg font-extrabold text-[#E2001]">{formatPrice(subtotal)}</p>
                </div>
                <Button
                  type="button"
                  onClick={handleCheckoutAll}
                  disabled={submitting}
                  className="w-full rounded-xl bg-[#E2001] hover:bg-[#DB0007] text-white text-sm font-bold pizza-glow disabled:opacity-60"
                >
                  {submitting ? 'Placing Order...' : 'Checkout All Items'}
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
