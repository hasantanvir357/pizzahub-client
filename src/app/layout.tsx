import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'PizzaHub | Hot & Fresh Artisan Pizza Delivery',
  description: 'Multi-vendor pizza ordering platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <WishlistProvider>
            <CartProvider>{children}</CartProvider>
          </WishlistProvider>
        </ThemeProvider>
        <Toaster position="top-right" richColors closeButton duration={2500} />
      </body>
    </html>
  );
}
