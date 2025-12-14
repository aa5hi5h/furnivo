'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/lib/supabase';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product.id, 1);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div
        className="group relative bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            />
          )}

          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-3 py-1 rounded-full">
              -{discount}%
            </div>
          )}

          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 flex items-center justify-center gap-3">
              <Button
                size="icon"
                variant="secondary"
                className="w-10 h-10 rounded-full"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="w-10 h-10 rounded-full"
                onClick={toggleWishlist}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="w-10 h-10 rounded-full"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-sm mb-2 line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-2">
            {product.original_price && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.original_price.toLocaleString()}
              </span>
            )}
            <span className="font-bold text-lg">₹{product.price.toLocaleString()}</span>
          </div>
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex text-yellow-400">
                {'★'.repeat(Math.round(product.rating))}
                {'☆'.repeat(5 - Math.round(product.rating))}
              </div>
              <span className="text-xs text-gray-600">({product.review_count})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
