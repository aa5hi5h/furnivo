'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Heart, ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import SearchDropdown from '@/components/search/SearchDropdown';

export default function Header() {
  const { cartCount, setIsCartOpen, user } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    { name: 'HOME', href: '/' },
    { name: 'COLLECTIONS', href: '/collections' },
    { name: 'LIVING ROOM', href: '/category/living-room' },
    { name: 'BEDROOM', href: '/category/bedroom' },
    { name: 'DINING', href: '/category/dining' },
    { name: 'OFFICE', href: '/category/office' },
    { name: 'OUTDOOR', href: '/category/outdoor' },
    { name: 'SALE', href: '/sale' },
    { name: 'DESIGN SERVICES', href: '/design-services' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-[1920px] mx-auto">
        <div className="px-6 py-4 flex items-center justify-between gap-8">
          <Link href="/" className="text-2xl font-serif font-bold text-[#2C2C2C] whitespace-nowrap">
            FURNIVO
          </Link>

          {/* Desktop Search */}
          <div className="hidden lg:block flex-1 max-w-xl">
            <SearchDropdown />
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden md:flex rounded-full px-6">
              Book Design Consult
            </Button>

            <Link
              href={user ? '/account' : '/auth'}
              className="hover:text-[#C47456] transition-colors"
            >
              <User className="w-6 h-6" />
            </Link>

            <Link
              href="/wishlist"
              className="hover:text-[#C47456] transition-colors"
            >
              <Heart className="w-6 h-6" />
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative hover:text-[#C47456] transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#C47456] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="lg:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className={`${
            mobileMenuOpen ? 'block' : 'hidden'
          } lg:block border-t border-gray-200`}
        >
          <ul className="flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-8 px-6 py-4 text-sm">
            {categories.map((category) => (
              <li key={category.name}>
                <Link
                  href={category.href}
                  className="block py-2 hover:text-[#C47456] font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Search */}
        <div className="lg:hidden px-6 pb-4">
          <SearchDropdown />
        </div>
      </div>
    </header>
  );
}