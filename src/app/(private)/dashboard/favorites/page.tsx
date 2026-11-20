'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, Trash2 } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import type { MenuItem } from '@/components/shared/MenuCard';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function FavoritesPage() {
  const { favorites, hydrated, removeFavorite } = useWishlist();
  const [catalog, setCatalog] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load the menu catalog once; favorites themselves come from WishlistContext
  // (persisted in localStorage under `pizzahub_favorites`).
  useEffect(() => {
    let ignore = false;
    const fetchCatalog = async () => {
      try {
        const res = await fetch(`${API_URL}/api/menu`);
        if (res.ok) {
          const data = await res.json();
          const list: MenuItem[] = data.items || data || [];
          if (!ignore) setCatalog(Array.isArray(list) ? list : []);
        }
      } catch {
        if (!ignore) setCatalog([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchCatalog();
    return () => {
      ignore = true;
    };
  }, []);

  // Fallback for saved items missing from the catalog response: fetch them
  // directly by id so no favorite silently disappears.
  useEffect(() => {
    const missing = favorites.filter((id) => !catalog.some((item) => item._id === id));
    if (missing.length === 0) return;
    let ignore = false;

    const fetchMissing = async () => {
      const results = await Promise.all(
        missing.map(async (id) => {
          try {
            const res = await fetch(`${API_URL}/api/menu/${id}`);
            if (!res.ok) return null;
            const data = await res.json();
            return (data.item || data) as MenuItem;
          } catch {
            return null;
          }
        })
      );
      if (ignore) return;
      const found = results.filter((item): item is MenuItem => Boolean(item?._id));
      if (found.length > 0) {
        setCatalog((prev) => [
          ...prev,
          ...found.filter((item) => !prev.some((existing) => existing._id === item._id)),
        ]);
      }
    };
    fetchMissing();
    return () => {
      ignore = true;
    };
  }, [catalog, favorites]);

  const favoriteItems = useMemo(() => {
    const ids = new Set(favorites);
    return catalog.filter((item) => ids.has(item._id));
  }, [catalog, favorites]);

  const handleRemove = (item: MenuItem) => {
    removeFavorite(item._id);
    toast.success(`${item.name} removed from favorites`);
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Favorites</h1>
          <p className="text-sm text-gray-500 mt-1">
            All the pizzas you saved, in one place.
          </p>
        </div>
        <Link
          href="/menu"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E20001] px-4 py-2 text-xs font-bold text-[#E20001] transition-all duration-300 hover:bg-[#E20001] hover:text-white active:scale-[0.98]"
        >
          Browse Menu
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading || !hydrated ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 || favoriteItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <span className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 text-[#E20001] flex items-center justify-center">
            <Heart className="w-7 h-7" />
          </span>
          <p className="text-base font-extrabold text-gray-900">No favorites yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Tap the heart on any pizza in the menu to save it here.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-xl bg-[#E20001] hover:bg-[#DB0007] px-5 py-2.5 text-sm font-bold text-white transition-colors"
          >
            Explore Menu
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          {favoriteItems.map((item) => (
            <article
              key={item._id}
              className="h-full flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-48 w-full shrink-0 bg-gray-100 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                />
                <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-gray-800 shadow-xs">
                  {item.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h2 className="text-lg font-bold text-gray-900">{item.name}</h2>
                {item.restaurantName && (
                  <p className="mt-0.5 text-xs font-medium text-[#E20001]">{item.restaurantName}</p>
                )}
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{item.description}</p>
                <p className="mt-4 text-lg font-extrabold text-gray-900">
                  ${Number(item.price).toFixed(2)}
                </p>

                <div className="mt-auto pt-4 flex items-center gap-2">
                  <Link
                    href={`/menu/${item._id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#E20001] hover:bg-[#DB0007] px-4 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E20001] px-3 py-2.5 text-xs font-bold text-[#E20001] transition-all duration-300 hover:bg-[#E20001] hover:text-white active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove from Favorites
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
