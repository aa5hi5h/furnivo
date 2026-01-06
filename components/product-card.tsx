'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  images: string[];
  colors?: string[];
  rating: number | null;
  reviewCount: number | null;
  stock: number;
  category: string;
  description?: string | null;
  featured: boolean;
}

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { data: session } = useSession();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) {
      toast({
        title: 'Out of stock',
        description: 'This product is currently unavailable',
        variant: 'error',
      });
      return;
    }
    addToCart(product.id, 1, product.colors?.[0] || '');
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
    });
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add items to your wishlist',
        variant: 'error',
      });
      return;
    }

    try {
      if (isWishlisted) {
        // Remove from wishlist logic here if needed
        setIsWishlisted(false);
        toast({
          title: 'Removed from wishlist',
          description: 'Product removed from your wishlist',
        });
      } else {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            productId: product.id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to add to wishlist');
        }

        setIsWishlisted(true);
        toast({
          title: 'Added to wishlist',
          description: data.message || 'Product added to your wishlist',
        });
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update wishlist',
        variant: 'error',
      });
    }
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div
        className="group relative bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.images && product.images.length > 0 && product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-3 py-1 rounded-full">
              -{discount}%
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute top-3 right-3 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">
              Out of Stock
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
                disabled={product.stock === 0}
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="w-10 h-10 rounded-full"
                onClick={toggleWishlist}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="w-10 h-10 rounded-full"
                aria-label="Quick view"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-sm mb-2 line-clamp-1">{product.name || 'Unnamed Product'}</h3>
          <div className="flex items-center gap-2">
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            <span className="font-bold text-lg">
              ₹{product.price ? product.price.toLocaleString('en-IN') : '0'}
            </span>
          </div>
          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex text-yellow-400 text-sm">
                {'★'.repeat(Math.round(product.rating))}
                {'☆'.repeat(5 - Math.round(product.rating))}
              </div>
              <span className="text-xs text-gray-600">({product.reviewCount || 0})</span>
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-xs text-orange-600 mt-2">
              Only {product.stock} left in stock!
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}