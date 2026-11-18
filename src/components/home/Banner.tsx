'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Clock, MapPin, Star } from 'lucide-react';

export default function Banner() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <section className="group relative w-full min-h-[82vh] flex items-center justify-center overflow-hidden rounded-3xl bg-gray-950 shadow-lg hover:shadow-2xl transition-all duration-500">
        <div className="absolute inset-0 animate-from-right">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-100 transition-transform duration-700 ease-out group-hover:scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop')`,
            }}
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-black/75 via-black/65 to-black/85" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-20 animate-from-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E20001]/20 border border-[#E20001]/50 text-[#FF6B6B] text-xs sm:text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-xs"
          >
            <Flame className="w-4 h-4 text-[#E20001]" />
            Wood-Fired & Handcrafted Daily
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6"
          >
            Hot & Fresh Pizza <span className="text-[#E20001] drop-shadow-[0_2px_15px_rgba(226,0,1,0.5)]">Delivered</span>{' '}
            to Your Door
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-lg text-gray-200 leading-relaxed mb-10"
          >
            Discover top local pizzerias, customize your favorite crust and toppings, and track your piping-hot order from
            the oven straight to your doorstep.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link
              href="/menu"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#E20001] hover:bg-[#DB0007] text-white font-bold text-base pizza-glow transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              Explore Pizza Menu
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Bottom Highlights Strip (Inspired by Template 2) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-gray-300 pt-6 border-t border-white/15"
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-white">4.9</span> Average Rating
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#E20001]" />
              <span>30-Min Express Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E20001]" />
              <span>50+ Verified Local Pizzerias</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
