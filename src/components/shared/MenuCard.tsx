'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart } from 'lucide-react';
import { getAuthUser, AuthUser } from '@/lib/auth-session';
import { toast } from 'sonner';

const FAVORITES_KEY = 'pizzahub_favorites';

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  restaurantName?: string;
  toppings?: string[];
  isPopular?: boolean;
  isOffer?: boolean;
  originalPrice?: number;
  discountLabel?: string;
}

export default function MenuCard({ item, index = 0 }: { item: MenuItem; index?: number }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const syncUser = () => setUser(getAuthUser());
    syncUser();
    window.addEventListener('auth-change', syncUser);
    return () => window.removeEventListener('auth-change', syncUser);
  }, []);

  // Sync heart state with the locally stored favorites list.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (!raw) return;
      const list = JSON.parse(raw);
      if (Array.isArray(list)) setFavorite(list.includes(item._id));
    } catch {
      // Ignore malformed localStorage values.
    }
  }, [item._id]);

  const toggleFavorite = () => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      let list: string[] = [];
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed;
      }

      if (favorite) {
        list = list.filter((id) => id !== item._id);
        setFavorite(false);
        toast('Removed from favorites');
      } else {
        list = Array.from(new Set([...list, item._id]));
        setFavorite(true);
        toast.success('Added to favorites');
      }
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
    } catch {
      // localStorage may be unavailable (e.g. private mode); fail silently.
    }
  };

  const isVendorOrAdmin = user?.role === 'vendor' || user?.role === 'admin';

  return (
    <div
      style={{ animationDelay: `${index * 110}ms` }}
      className="group bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl hover:-translate-y-2 hover:border-[#E20001]/35 transition-all duration-500 overflow-hidden flex flex-col animate-from-bottom"
    >
      {/* Image & Badge */}
      <div className="relative h-52 w-full bg-gray-100 overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-gray-800 shadow-xs">
            {item.category}
          </span>
          {item.isPopular && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E20001] text-white">
              Popular
            </span>
          )}
        </div>
        {/* Wishlist Toggle */}
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={favorite}
          className={`absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-full shadow-md transition-all duration-300 ${
            favorite
              ? 'bg-[#E20001] text-white hover:bg-[#DB0007]'
              : 'bg-white/95 text-gray-400 hover:text-[#E20001] hover:scale-110'
          }`}
        >
          <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
          {item.restaurantName && <p className="text-xs font-medium text-[#E20001] mt-0.5">{item.restaurantName}</p>}
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.description}</p>

          {/* Toppings Pills */}
          {item.toppings && item.toppings.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {item.toppings.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2.5 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-600 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-400">from </span>
            <span className="text-lg font-extrabold text-gray-900">${item.price.toFixed(2)}</span>
          </div>
          {isVendorOrAdmin ? (
            <Link
              href={`/menu/${item._id}`}
              className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E20001] hover:bg-[#DB0007] text-white text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              View Details
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          ) : (
            <Link
              href={`/menu/${item._id}`}
              className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E20001] hover:bg-[#DB0007] text-white text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              Order Now
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
