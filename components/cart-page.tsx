'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  
  // Track optimistic updates
  const [optimisticItems, setOptimisticItems] = useState<Record<string, number>>({});
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [isClearing, setIsClearing] = useState(false);

  // Get display quantity
  const getDisplayQuantity = (itemId: string, actualQuantity: number) => {
    return optimisticItems[itemId] ?? actualQuantity;
  };

  // Calculate totals
  const displayItems = items.filter(item => !removingItems.has(item.id));
  
  const subtotal = displayItems.reduce((total, item) => {
    const price = item.product?.price || 0;
    const quantity = getDisplayQuantity(item.id, item.quantity);
    return total + (price * quantity);
  }, 0);

  const shipping = subtotal > 50000 ? 0 : 500; // Free shipping over ₹50,000
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  // Optimistic quantity update
  const handleQuantityChange = async (itemId: string, newQuantity: number, maxStock: number) => {
    const clampedQuantity = Math.max(1, Math.min(maxStock, newQuantity));
    setOptimisticItems(prev => ({ ...prev, [itemId]: clampedQuantity }));
    
    try {
      await updateQuantity(itemId, clampedQuantity);
      setOptimisticItems(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    } catch (error) {
      setOptimisticItems(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    }
  };

  // Optimistic remove
  const handleRemove = async (itemId: string) => {
    setRemovingItems(prev => new Set(prev).add(itemId));
    
    try {
      await removeFromCart(itemId);
    } catch (error) {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Clear cart
  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    
    setIsClearing(true);
    try {
      await clearCart();
    } finally {
      setIsClearing(false);
    }
  };

  // Redirect if not logged in
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Please sign in</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your cart</p>
          <Button onClick={() => router.push('/auth')} className="bg-[#C47456] hover:bg-[#B36647]">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (displayItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to get started</p>
          <Link href="/products">
            <Button className="bg-[#C47456] hover:bg-[#B36647]">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-[#C47456] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            {displayItems.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearCart}
                disabled={isClearing}
                className="text-red-600 hover:text-red-700 hover:border-red-600"
              >
                {isClearing ? 'Clearing...' : 'Clear Cart'}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {displayItems.map((item) => {
              const displayQuantity = getDisplayQuantity(item.id, item.quantity);
              const maxStock = item.product?.stock || 99;
              const itemTotal = (item.product?.price || 0) * displayQuantity;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm p-6 transition-opacity duration-200"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name || 'Product'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.product?.name || 'Product'}
                          </h3>
                          {item.color && (
                            <p className="text-sm text-gray-500 mt-1">Color: {item.color}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-2xl font-bold text-[#C47456] mb-4">
                        ₹{item.product?.price?.toLocaleString('en-IN') || '0'}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, displayQuantity - 1, maxStock)}
                              disabled={displayQuantity <= 1}
                              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-lg font-semibold w-12 text-center">
                              {displayQuantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, displayQuantity + 1, maxStock)}
                              disabled={displayQuantity >= maxStock}
                              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="text-xl font-bold text-gray-900">
                            ₹{itemTotal.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {maxStock <= 5 && (
                        <p className="text-sm text-orange-600 mt-2">
                          Only {maxStock} left in stock!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${shipping.toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Tax (GST 18%)</span>
                  <span className="font-semibold">
                    ₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-[#C47456]">
                      ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {subtotal < 50000 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    Add ₹{(50000 - subtotal).toLocaleString('en-IN')} more for free shipping!
                  </p>
                </div>
              )}

              <Link href="/checkout" className="block w-full">
                <Button className="w-full bg-[#C47456] hover:bg-[#B36647] text-white py-6 text-lg font-semibold">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link href="/" className="block w-full mt-3">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}