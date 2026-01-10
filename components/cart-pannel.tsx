'use client';

import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPanel() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-serif font-bold">Shopping Cart</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="hover:text-[#C47456] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Image src="/cart-empty.svg" alt="Empty cart" width={48} height={48} className="opacity-50" />
            </div>
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Button
              onClick={() => setIsCartOpen(false)}
              className="bg-[#2C2C2C] hover:bg-[#2C2C2C]/90"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {cart.map((item:any) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images[0] && (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 truncate">{item.product.name}</h3>
                      {item.selected_color && (
                        <p className="text-xs text-gray-600 mb-2">Color: {item.selected_color}</p>
                      )}
                      <p className="font-bold text-sm">₹{item.product.price.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:border-[#C47456]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:border-[#C47456]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t p-6 space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-bold">₹{cartTotal.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-600">Shipping and taxes calculated at checkout</p>
              <div className="space-y-2">
                <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                  <Button className="w-full bg-[#2C2C2C] hover:bg-[#2C2C2C]/90 text-white">
                    Checkout
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsCartOpen(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}