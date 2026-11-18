import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Leaf, Flame, Truck } from 'lucide-react';

export default function HomeHighlights() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Special Offer Banner */}
      <div className="rounded-3xl bg-linear-to-r from-[#E20001] to-[#DB0007] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 pizza-glow">
        <div className="max-w-xl space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider">
            Weekend Special Offer
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">Get 25% Off On Family Wood-Fired Combos</h2>
          <p className="text-red-100 text-sm sm:text-base">
            Order any two large artisan pizzas and enjoy complimentary garlic bread with express doorstep delivery.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#E20001] font-bold text-sm hover:bg-gray-100 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Order Now
          </Link>
        </div>
        <Image
          src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80"
          alt="Special Pizza Offer"
          width={600}
          height={600}
          unoptimized
          className="w-64 h-64 sm:w-72 sm:h-72 object-cover rounded-2xl shadow-2xl border-4 border-white/20"
        />
      </div>

      {/* Why Choose PizzaHub (Clean 3-Column Feature) */}
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900">Why Pizza Lovers Choose PizzaHub</h2>
        <p className="text-gray-500 text-sm sm:text-base mt-3">
          From hand-tossed dough to stone-oven baking, every partner restaurant follows authentic quality standards.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10">
          <div>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 text-[#E20001] flex items-center justify-center transition-colors duration-300 hover:bg-[#E20001] hover:text-white">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#E20001]">Fresh Ingredients</h3>
            <p className="text-sm text-gray-500 mt-2">
              100% real mozzarella, vine-ripened tomatoes, and locally sourced toppings.
            </p>
          </div>
          <div>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 text-[#E20001] flex items-center justify-center transition-colors duration-300 hover:bg-[#E20001] hover:text-white">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#E20001]">Stone-Oven Baked</h3>
            <p className="text-sm text-gray-500 mt-2">
              Hand-stretched crust baked at high heat for that crispy, smoky perfection.
            </p>
          </div>
          <div>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 text-[#E20001] flex items-center justify-center transition-colors duration-300 hover:bg-[#E20001] hover:text-white">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#E20001]">30-Min Delivery</h3>
            <p className="text-sm text-gray-500 mt-2">
              Insulated hot-box delivery straight from the kitchen to your table.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
