'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, X, ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  description?: string;
  images: string[];
  colors?: string[];
  rating: number;
  review_count: number;
  stock: number;
}

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: (productId: string, color: string, quantity: number) => void;
  onAddToWishlist: (productId: string) => void;
}

export function QuickViewModal({
  product,
  open,
  onClose,
  onAddToCart,
  onAddToWishlist,
}: QuickViewModalProps) {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    onAddToCart(product.id, selectedColor, quantity);
    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogClose className="absolute right-4 top-4 z-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
            {product.images && product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200" />
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating.toFixed(1)} ({product.review_count} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                {product.original_price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ₹{product.original_price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Select Color
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border-2 rounded transition-all text-sm ${
                          selectedColor === color
                            ? 'border-[#C47456] bg-[#C47456] text-white'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <span
                  className={`text-sm font-semibold ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={isAdding || product.stock === 0}
                className="flex-1 bg-[#2C2C2C] hover:bg-[#C47456] text-white"
              >
                <ShoppingCart size={18} className="mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={() => onAddToWishlist(product.id)}
                variant="outline"
                className="border-gray-300"
              >
                <Heart size={18} />
              </Button>
            </div>

            {/* View Full Details Link */}
            <Link
              href={`/products/${product.slug}`}
              className="text-center mt-4 text-[#C47456] hover:text-[#2C2C2C] font-semibold transition-colors"
            >
              View Full Details →
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}