'use client';

import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const REVIEWS = [
  {
    initials: 'SM',
    name: 'Sofia Marchetti',
    date: 'October 2026',
    ordered: 'Margherita Classica',
    comment:
      'Crust is perfectly charred and chewy, and it arrived piping hot in under 25 minutes. Easily my go-to pizza spot!',
  },
  {
    initials: 'JO',
    name: "James O'Brien",
    date: 'November 2026',
    ordered: 'Pepperoni Supreme',
    comment: 'Generous toppings, rich tomato sauce, and super smooth ordering experience from start to finish.',
  },
  {
    initials: 'PN',
    name: 'Priya Nair',
    date: 'November 2026',
    ordered: 'Veggie Garden & Garlic Bread',
    comment:
      'Loved being able to browse multiple local pizzerias in one place. The garlic bread was crispy on the outside and soft inside.',
  },
];

export default function GuestReviews() {
  return (
    <section className="bg-[#FFF8F6] py-16 border-t border-red-100">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E20001]">What Our Guests Say</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1">Customer Reviews</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.name}
              className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E20001] text-white font-bold text-sm flex items-center justify-center">
                      {rev.initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{rev.name}</h4>
                      <p className="text-xs text-gray-400">{rev.date}</p>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-[#E20001] text-xs font-semibold">
                  Ordered: {rev.ordered}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
