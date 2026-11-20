'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export const FAVORITES_KEY = 'pizzahub_favorites';

interface WishlistContextValue {
  /** Menu item ids saved by the current user. */
  favorites: string[];
  /** False until localStorage has been read on the client. */
  hydrated: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

/** Single source of truth for favorites, shared by MenuCard and the dashboard page. */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrate = () => {
      setFavorites(readFavorites());
      setHydrated(true);
    };
    hydrate();
    window.addEventListener('storage', hydrate);
    return () => window.removeEventListener('storage', hydrate);
  }, []);

  const persist = useCallback((next: string[]) => {
    setFavorites(next);
    setHydrated(true);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      // localStorage may be unavailable — keep the in-memory list working.
    }
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      persist(favorites.includes(id) ? favorites.filter((entry) => entry !== id) : [...favorites, id]);
    },
    [favorites, persist]
  );

  const removeFavorite = useCallback(
    (id: string) => persist(favorites.filter((entry) => entry !== id)),
    [favorites, persist]
  );

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const value = useMemo<WishlistContextValue>(
    () => ({ favorites, hydrated, isFavorite, toggleFavorite, removeFavorite }),
    [favorites, hydrated, isFavorite, removeFavorite, toggleFavorite]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
