import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PizzaHub - Hot & Fresh Pizza Delivery',
  description: 'Multi-vendor pizza ordering platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
