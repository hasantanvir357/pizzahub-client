"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MenuCard, { MenuItem } from "@/components/shared/MenuCard";
import { ArrowRight } from "lucide-react";

export default function FeaturedMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu?limit=6`);
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
    fetchMenu();
  }, []);

  return (
    <section className="bg-[#FFFDFB] py-16 border-y border-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#E20001]">
              Our Menu
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1">
              Popular Handcrafted Pizzas
            </h2>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#E20001] hover:text-[#DB0007]"
          >
            View Full Menu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.slice(0, 6).map((item) => (
              <MenuCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm">
              Fresh pizzas from our partner kitchens will appear here once added.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}