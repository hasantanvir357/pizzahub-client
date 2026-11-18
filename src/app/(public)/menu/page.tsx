export default function MenuPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#E20001]">
        PizzaHub
      </span>
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
        Browse Our Menu
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-500 sm:text-base">
        Our full pizza menu is coming soon. Stay tuned for wood-fired favorites!
      </p>
    </div>
  );
}
