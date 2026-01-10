'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Heart, ShoppingCart, Menu, X, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import SearchDropdown from '@/components/search/SearchDropdown';
import Image from 'next/image';

export default function Header() {
  const { items, itemCount, removeFromCart, updateQuantity } = useCart();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Track optimistic updates locally
  const [optimisticItems, setOptimisticItems] = useState<Record<string, number>>({});
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

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

  // Get the display quantity (optimistic or actual)
  const getDisplayQuantity = (itemId: string, actualQuantity: number) => {
    return optimisticItems[itemId] ?? actualQuantity;
  };

  // Calculate cart total with optimistic updates
  const getCartTotal = () => {
    return items
      .filter(item => !removingItems.has(item.id))
      .reduce((total, item) => {
        const price = item.product?.price || 0;
        const quantity = getDisplayQuantity(item.id, item.quantity);
        return total + (price * quantity);
      }, 0);
  };

  // Optimistic quantity update
  const handleQuantityChange = async (itemId: string, newQuantity: number, maxStock: number) => {
    // Clamp quantity between 1 and stock
    const clampedQuantity = Math.max(1, Math.min(maxStock, newQuantity));
    
    // Immediately update UI
    setOptimisticItems(prev => ({ ...prev, [itemId]: clampedQuantity }));
    
    // Update server in background
    try {
      await updateQuantity(itemId, clampedQuantity);
      // Clear optimistic state after successful update
      setOptimisticItems(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    } catch (error) {
      // Revert on error
      setOptimisticItems(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    }
  };

  // Optimistic remove
  const handleRemove = async (itemId: string) => {
    // Immediately hide item
    setRemovingItems(prev => new Set(prev).add(itemId));
    
    // Remove from server in background
    try {
      await removeFromCart(itemId);
    } catch (error) {
      // Revert on error
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Filter out items being removed
  const displayItems = items.filter(item => !removingItems.has(item.id));

  return (
    <>
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
                href={session?.user ? '/account' : '/auth'}
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
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#C47456] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {itemCount}
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

      {/* Cart Sidebar Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Shopping Cart ({displayItems.length})</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {displayItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">Your cart is empty</p>
                <p className="text-sm text-gray-400">Add some items to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayItems.map((item) => {
                  const displayQuantity = getDisplayQuantity(item.id, item.quantity);
                  const maxStock = item.product?.stock || 99;
                  
                  return (
                    <div 
                      key={item.id} 
                      className="flex gap-4 pb-4 border-b transition-opacity duration-200"
                    >
                      <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {item.product?.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name || 'Product'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {item.product?.name || 'Product'}
                        </h3>
                        {item.color && (
                          <p className="text-xs text-gray-500 mt-0.5">Color: {item.color}</p>
                        )}
                        <p className="text-[#C47456] font-semibold mt-1">
                          ₹{item.product?.price?.toLocaleString('en-IN') || '0'}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, displayQuantity - 1, maxStock)}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={displayQuantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {displayQuantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, displayQuantity + 1, maxStock)}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={displayQuantity >= maxStock}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors active:scale-95"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {displayItems.length > 0 && (
            <div className="border-t p-6 space-y-4 bg-gray-50">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Subtotal:</span>
                <span className="text-[#C47456]">
                  ₹{getCartTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              <Link
                href="/cart"
                onClick={() => setIsCartOpen(false)}
                className="block w-full"
              >
                <Button className="w-full bg-[#C47456] hover:bg-[#B36647] text-white transition-colors">
                  View Cart
                </Button>
              </Link>
              
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="block w-full"
              >
                <Button className="w-full bg-[#2C2C2C] hover:bg-[#1C1C1C] text-white transition-colors">
                  Checkout
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}