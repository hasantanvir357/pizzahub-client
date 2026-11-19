'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart, type CartLineItem } from '@/context/CartContext';
import { getAuthUser, getToken, type AuthUser } from '@/lib/auth-session';
import { toast } from 'sonner';

export default function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, updateQuantity, removeItem, itemCount, subtotal } = useCart();
  const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());
  const [mounted, setMounted] = useState(false);

  // Portals require a real DOM node; render nothing until mounted on the client.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const syncUser = () => setUser(getAuthUser());
    syncUser();
    window.addEventListener('auth-change', syncUser);
    return () => window.removeEventListener('auth-change', syncUser);
  }, []);

  const requireCustomer = (): boolean => {
    const token = getToken();
    if (!token || !user) {
      toast.error('Please sign in or create a customer account to place an order.');
      closeCart();
      router.push('/sign-in');
      return false;
    }
    if (user.role !== 'customer') {
      toast.warning('Only Customer accounts can place orders. Please sign in with a Customer account.');
      return false;
    }
    return true;
  };

  const handleOrderNow = (item: CartLineItem) => {
    if (!requireCustomer()) return;
    closeCart();
    router.push(
      `/checkout?mode=single&id=${encodeURIComponent(item.menuItemId)}&size=${encodeURIComponent(
        item.size || 'Regular'
      )}`
    );
  };

  const handleCheckoutAll = () => {
    if (items.length === 0) return;
    if (!requireCustomer()) return;
    closeCart();
    router.push('/checkout?mode=all');
  };

  const formatPrice = (value: number) => `$${Number(value).toFixed(2)}`;

  // SSR safety: `document` is unavailable during server rendering, so skip the
  // portal entirely until the component has mounted on the client.
  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] bg-black/60"
            onClick={closeCart}
            data-testid="cart-overlay"
          />

          {/* Slide-over panel */}
          <motion.aside
            key="cart-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 z-[9999] h-screen w-full max-w-md bg-white shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#E20001]" />
                Your Cart ({itemCount} {itemCount === 1 ? 'Item' : 'Items'})
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold">
                  {itemCount}
                </span>
              </h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="p-2 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Item Menu List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-[#E20001]" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Your cart is empty.</p>
                  <p className="text-xs text-gray-500">Add some delicious pizza to get started.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li
                      key={`${item.menuItemId}:${item.size || 'Regular'}`}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3"
                    >
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
                          <div className="w-12 h-12 rounded-xl bg-red-50 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                          {item.size && <p className="text-xs text-gray-500 mt-0.5">{item.size} size</p>}
                          <p className="text-xs font-bold text-[#E20001] mt-1">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                          <p className="text-sm font-extrabold text-gray-900 mt-0.5">
                            Subtotal: {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name} from cart`}
                          onClick={() => removeItem(item.menuItemId, item.size)}
                          className="shrink-0 w-8 h-8 rounded-full bg-red-50 border border-red-100 text-[#E20001] hover:bg-red-100 hover:text-[#DB0007] flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-100">
                        {/* Quantity controls */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-2 py-1">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.menuItemId, item.size, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-gray-900 min-w-4 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.menuItemId, item.size, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOrderNow(item)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold opacity-100 rounded-full px-4 py-2 text-sm shadow-sm"
                        >
                          Order Now
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Sticky Footer */}
            {items.length > 0 && (
              <div className="sticky bottom-0 border-t border-gray-100 bg-white px-6 py-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-700">Total Items</p>
                  <p className="text-sm font-extrabold text-gray-900">{itemCount}</p>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-gray-700">Subtotal / Grand Total</p>
                  <p className="text-lg font-extrabold text-gray-900">{formatPrice(subtotal)}</p>
                </div>
                {!user && (
                  <p className="text-xs font-semibold text-gray-600 text-center mb-3">
                    Sign in as a Customer to complete your order
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleCheckoutAll}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl py-3 text-sm shadow-sm opacity-100"
                >
                  Checkout All Items ($${subtotal.toFixed(2)})
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
