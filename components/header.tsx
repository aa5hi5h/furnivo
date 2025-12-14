'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, User, Heart, ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Header() {
  const { cartCount, setIsCartOpen, user } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

          <div className="hidden lg:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-full border-gray-300"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="hidden md:flex rounded-full px-6"
            >
              Book Design Consult
            </Button>

            <Link href={user ? '/account' : '/auth'} className="hover:text-[#C47456]">
              <User className="w-6 h-6" />
            </Link>

            <Link href="/wishlist" className="hover:text-[#C47456]">
              <Heart className="w-6 h-6" />
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative hover:text-[#C47456]"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#C47456] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block border-t border-gray-200`}>
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

        <div className="lg:hidden px-6 pb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-full border-gray-300"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
