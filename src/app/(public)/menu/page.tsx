'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import MenuCard, { MenuItem } from '@/components/shared/MenuCard';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, ArrowRight } from 'lucide-react';

const CATEGORIES = ['All', 'Classic Pizza', 'Meat Lovers', 'Veggie Delight', 'Sides & Drinks'];

export default function BrowseMenuPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [items, setItems] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<MenuItem[]>([]);
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('default');

  // Offers are fetched once so the banner stays stable while the grid filters.
  useEffect(() => {
    let ignore = false;
    const fetchOffers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu`);
        if (res.ok) {
          const data = await res.json();
          const all: MenuItem[] = data.items || data || [];
          if (!ignore) setOffers(all.filter((item) => item.isOffer === true));
        }
      } catch {
        if (!ignore) setOffers([]);
      }
    };
    fetchOffers();
    return () => {
      ignore = true;
    };
  }, []);

  const showPrevOffer = () =>
    setActiveOfferIndex((prev) => (prev - 1 + offers.length) % offers.length);
  const showNextOffer = () => setActiveOfferIndex((prev) => (prev + 1) % offers.length);

  const activeOffer = offers[activeOfferIndex] ?? offers[0];
  const discountPercent =
    activeOffer?.originalPrice && activeOffer.originalPrice > activeOffer.price
      ? Math.round((1 - activeOffer.price / activeOffer.originalPrice) * 100)
      : null;

  useEffect(() => {
    const fetchMenus = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (category && category !== 'All') params.set('category', category);
        if (sortBy !== 'default') params.set('sort', sortBy);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || data || []);
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchMenus, 300);
    return () => clearTimeout(timer);
  }, [search, category, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top Red Offer Banner */}
      {activeOffer && (
        <div
          className="group mb-10 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 animate-from-top"
          style={{ background: 'linear-gradient(135deg, #E20001 0%, #B80001 100%)' }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
            {/* Offer Copy */}
            <div className="flex-1 text-white min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-white text-[#E20001] text-[11px] font-extrabold uppercase tracking-wider shadow-xs">
                  {activeOffer.discountLabel ||
                    (discountPercent ? `${discountPercent}% OFF` : 'Special Offer')}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">
                  Today&apos;s Hot Deal
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 leading-tight">
                {activeOffer.name}
              </h2>
              <p className="text-sm text-white/85 mt-2 max-w-xl">{activeOffer.description}</p>

              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-extrabold">
                  ${activeOffer.price.toFixed(2)}
                </span>
                {activeOffer.originalPrice && activeOffer.originalPrice > activeOffer.price && (
                  <span className="text-lg font-bold text-white/70 line-through">
                    ${activeOffer.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Order Now + Offer Switcher */}
              <div className="flex flex-wrap items-center gap-4 mt-5">
                <Link
                  href={`/menu/${activeOffer._id}`}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#E20001] text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:bg-gray-50"
                >
                  Order Now
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                {offers.length > 1 && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={showPrevOffer}
                      aria-label="Previous offer"
                      className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center text-white transition-all duration-300 ease-out hover:bg-white/15"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      {offers.map((offer, index) => (
                        <button
                          key={offer._id}
                          type="button"
                          onClick={() => setActiveOfferIndex(index)}
                          aria-label={`Show offer ${index + 1}`}
                          className={`h-2 rounded-full transition-all duration-300 ease-out ${
                            index === activeOfferIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={showNextOffer}
                      aria-label="Next offer"
                      className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center text-white transition-all duration-300 ease-out hover:bg-white/15"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Offer Image */}
            <div className="relative w-full sm:w-64 h-44 sm:h-44 shrink-0 rounded-2xl overflow-hidden ring-2 ring-white/40">
              <Image
                src={activeOffer.image}
                alt={activeOffer.name}
                fill
                sizes="(max-width: 640px) 100vw, 256px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#E20001]">Fresh From The Oven</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1 animate-from-left">Explore Our Full Menu</h1>
        <p className="text-sm text-gray-500 mt-2">
          Search by pizza name, filter by your favorite category, or sort by price.
        </p>
      </div>

      {/* Search, Category Tabs & Sort Bar */}
      <div className="bg-[#FFFDFB] p-4 sm:p-5 rounded-2xl border border-red-100 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pizzas, toppings, or restaurants..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-500 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#E20001]"
            >
              <option value="default">Sort: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                category === cat
                  ? 'bg-[#E20001] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#E20001] hover:text-[#E20001]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <MenuCard key={item._id} item={item} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-base font-bold text-gray-800">No pizzas found</p>
          <p className="text-sm text-gray-500 mt-1">Try clearing your search or selecting a different category.</p>
        </div>
      )}
    </div>
  );
}
