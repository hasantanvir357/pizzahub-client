'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAuthUser, AuthUser } from '@/lib/auth-session';

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

  useEffect(() => {
    const syncUser = () => setUser(getAuthUser());
    syncUser();
    window.addEventListener('auth-change', syncUser);
    return () => window.removeEventListener('auth-change', syncUser);
  }, []);

  const isVendorOrAdmin = user?.role === 'vendor' || user?.role === 'admin';

  return (
    <div
      style={{ animationDelay: `${index * 70}ms` }}
      className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl hover:-translate-y-2 hover:border-[#E20001]/35 transition-all duration-300 overflow-hidden flex flex-col animate-from-bottom"
    >
      {/* Image & Badge */}
      <div className="relative h-52 w-full bg-gray-100 overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-gray-800 shadow-xs">
          {item.category}
        </span>
        {item.isPopular && (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-[#E20001] text-white">
            Popular
          </span>
        )}
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
              className="px-4 py-2 rounded-lg bg-[#E20001] hover:bg-[#DB0007] text-white text-xs font-bold transition-colors"
            >
              View Details
            </Link>
          ) : (
            <Link
              href={`/menu/${item._id}`}
              className="px-4 py-2 rounded-lg bg-[#E20001] hover:bg-[#DB0007] text-white text-xs font-bold transition-colors"
            >
              Order Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
