'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const CATEGORIES = [
  {
    name: 'Classic Pizza',
    desc: 'Margherita, Marinara & timeless favorites',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
  },
  {
    name: 'Meat Lovers',
    desc: 'Loaded with pepperoni, sausage & beef',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80',
  },
  {
    name: 'Veggie Delight',
    desc: 'Farm-fresh peppers, mushrooms & olives',
    image: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=600&q=80',
  },
  {
    name: 'Sides & Drinks',
    desc: 'Cheesy garlic bread, wings & chilled drinks',
    image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=600&q=80',
  },
];

export default function Categories() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E20001]">Explore By Taste</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1">Choose Your Category</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/menu?category=${encodeURIComponent(cat.name)}`}
              className="group relative h-56 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-xl font-bold group-hover:text-[#FF6B6B] transition-colors">{cat.name}</h3>
                <p className="text-xs text-gray-200 mt-1">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
