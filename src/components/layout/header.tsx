'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingCart, User, QrCode } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart/cart-provider';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/#menu', label: 'Menu' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const { state: { items }, dispatch } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname === '/scan') {
    return null;
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled ? 'bg-card/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/scan">
              <Button variant="ghost" size="icon" className="rounded-full">
                <QrCode className="h-5 w-5" />
                <span className="sr-only">Scan Table QR</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              aria-label={`Open cart with ${totalItems} items`}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Button>
            <Link href="/admin/login">
              <Button variant="outline" size="sm" className="rounded-full hidden sm:flex">
                <User className="h-4 w-4 mr-2" />
                Admin
              </Button>
              <Button variant="outline" size="icon" className="rounded-full sm:hidden">
                 <User className="h-4 w-4" />
                 <span className="sr-only">Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
