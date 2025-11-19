'use client';

import { usePathname } from 'next/navigation';
import { CartProvider } from '@/components/cart/cart-provider';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { CartSidebar } from '@/components/cart/cart-sidebar';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
       <div className="flex min-h-screen flex-col bg-card">
          <main className="flex-1">{children}</main>
        </div>
    )
  }

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <CartSidebar />
        <main className="flex-1 pt-16 sm:pt-20">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
