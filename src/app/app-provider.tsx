'use client';

import { CartProvider } from '@/components/cart/cart-provider';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { CartSidebar } from '@/components/cart/cart-sidebar';

export function AppProvider({ children }: { children: React.ReactNode }) {
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
