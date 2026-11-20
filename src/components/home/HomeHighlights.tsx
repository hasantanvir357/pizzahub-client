'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ComponentType } from 'react';
import { ShoppingCart, Leaf, Flame, Truck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function SpecialOfferBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        className="group rounded-3xl bg-linear-to-r from-[#E20001] to-[#DB0007] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 pizza-glow hover:shadow-2xl transition-all duration-500"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="max-w-xl space-y-4 animate-from-left">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider">
            Weekend Special Offer
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">Get 25% Off On Family Wood-Fired Combos</h2>
          <p className="text-red-100 text-sm sm:text-base">
            Order any two large artisan pizzas and enjoy complimentary garlic bread with express doorstep delivery.
          </p>
          <Link
            href="/menu"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#E20001] font-bold text-sm hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            Order Now
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 overflow-hidden rounded-2xl shadow-2xl border-4 border-white/20 animate-from-right">
          <Image
            src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80"
            alt="Special Pizza Offer"
            width={600}
            height={600}
            unoptimized
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
      </motion.div>
    </section>
  );
}

export function WhyChooseUs() {
  const features: {
    key: string;
    title: string;
    desc: string;
    icon: ComponentType<{ className?: string }>;
    iconClass: string;
    innerClass?: string;
  }[] = [
    {
      key: 'fresh',
      title: 'Fresh Ingredients',
      desc: '100% real mozzarella, vine-ripened tomatoes, and locally sourced toppings.',
      icon: Leaf,
      iconClass: 'animate-herb-sway group-hover:bg-[#E20001] group-hover:text-white group-hover:shadow-[0_0_24px_rgba(226,0,1,0.45)]',
    },
    {
      key: 'stone',
      title: 'Stone-Oven Baked',
      desc: 'Hand-stretched crust baked at high heat for that crispy, smoky perfection.',
      icon: Flame,
      iconClass: 'animate-ember-pulse group-hover:bg-[#E20001] group-hover:text-white',
      innerClass: 'animate-flame-flicker',
    },
    {
      key: 'delivery',
      title: '30-Min Delivery',
      desc: 'Insulated hot-box delivery straight from the kitchen to your table.',
      icon: Truck,
      iconClass: 'group-hover:bg-[#E20001] group-hover:text-white',
      innerClass: 'animate-drive-glide group-hover:[animation-duration:1.1s]',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        className="text-center max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h2 className="text-3xl font-extrabold text-gray-900 animate-from-left">Why Pizza Lovers Choose PizzaHub</h2>
        <p className="text-gray-500 text-sm sm:text-base mt-3">
          From hand-tossed dough to stone-oven baking, every partner restaurant follows authentic quality standards.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.key}
                className="group rounded-2xl p-4 border border-transparent transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:border-neutral-200/80"
              >
                <div
                  className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 text-[#E20001] flex items-center justify-center transition-all duration-300 ${feature.iconClass ?? ''}`}
                >
                  <Icon className={`w-6 h-6 ${feature.innerClass ?? ''}`} />
                </div>
                <h3 className="text-lg font-bold text-[#E20001]">{feature.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{feature.desc}</p>

                {/* Moving road dashes for the delivery card */}
                {feature.key === 'delivery' && (
                  <div className="mt-3 h-1.5 w-24 mx-auto rounded-full opacity-70 animate-road-dash group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
