'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MenuCard, { MenuItem } from '@/components/shared/MenuCard';
import { Search, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = ['All', 'Classic Pizza', 'Meat Lovers', 'Veggie Delight', 'Sides & Drinks'];

export default function BrowseMenuPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('default');

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
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#E20001]">Fresh From The Oven</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1">Explore Our Full Menu</h1>
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
          {items.map((item) => (
            <MenuCard key={item._id} item={item} />
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
