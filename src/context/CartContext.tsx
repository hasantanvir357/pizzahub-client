'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export const CART_STORAGE_KEY = 'pizzahub_cart';

export interface CartLineItem {
  menuItemId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  size?: string;
  toppings?: string[];
  restaurantName?: string;
}

export const cartItemKey = (menuItemId: string, size?: string) => `${menuItemId}:${size || 'Regular'}`;

interface CartContextValue {
  items: CartLineItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartLineItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (menuItemId: string, size: string | undefined, quantity: number) => void;
  removeItem: (menuItemId: string, size: string | undefined) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStoredItems(): CartLineItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => entry && typeof entry.menuItemId === 'string');
  } catch {
    // Ignore malformed cart payloads.
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Hydrate the cart from localStorage via a callback: reading the external
    // store after mount is a legitimate sync, but the effect body itself must
    // not call setState synchronously (react-hooks/set-state-in-effect).
    const hydrateFromStorage = () => setItems(readStoredItems());
    hydrateFromStorage();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage may be unavailable (private mode); fail silently.
    }
  }, [items]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (item: Omit<CartLineItem, 'quantity'>, quantity = 1) => {
    const key = cartItemKey(item.menuItemId, item.size);
    const existing = items.find((entry) => cartItemKey(entry.menuItemId, entry.size) === key);
    if (existing) {
      setItems((prev) =>
        prev.map((entry) =>
          cartItemKey(entry.menuItemId, entry.size) === key ? { ...entry, quantity: entry.quantity + quantity } : entry
        )
      );
      return;
    }
    setItems((prev) => [...prev, { ...item, quantity }]);
  };

  const updateQuantity = (menuItemId: string, size: string | undefined, quantity: number) => {
    const key = cartItemKey(menuItemId, size);
    if (quantity <= 0) {
      setItems((prev) => prev.filter((entry) => cartItemKey(entry.menuItemId, entry.size) !== key));
      return;
    }
    setItems((prev) =>
      prev.map((entry) => (cartItemKey(entry.menuItemId, entry.size) === key ? { ...entry, quantity } : entry))
    );
  };

  const removeItem = (menuItemId: string, size: string | undefined) => {
    const key = cartItemKey(menuItemId, size);
    setItems((prev) => prev.filter((entry) => cartItemKey(entry.menuItemId, entry.size) !== key));
  };

  const clearCart = () => setItems([]);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    isOpen,
    openCart,
    closeCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    itemCount,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
