'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [isCheckingWishlist, setIsCheckingWishlist] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check if product is in wishlist on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (status !== 'authenticated' || !session?.user?.id) {
        setIsWishlisted(false);
        setWishlistItemId(null);
        return;
      }

      setIsCheckingWishlist(true);
      try {
        const response = await fetch(`/api/wishlist?userId=${session.user.id}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const wishlistItem = result.data.find(
              (item: any) => item.productId === product.id
            );
            if (wishlistItem) {
              setIsWishlisted(true);
              setWishlistItemId(wishlistItem.id);
            } else {
              setIsWishlisted(false);
              setWishlistItemId(null);
            }
          }
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      } finally {
        setIsCheckingWishlist(false);
      }
    };

    checkWishlistStatus();
  }, [status, session?.user?.id, product.id]);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock === 0) {
      toast({
        title: 'Out of stock',
        description: 'This product is currently unavailable',
        variant: 'error',
      });
      return;
    }

    if (status !== 'authenticated' || !session?.user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add items to cart',
        variant: 'error',
      });
      router.push('/auth');
      return;
    }

    await addToCart(product.id, 1, product.colors?.[0] || '');
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
    });
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (status !== 'authenticated' || !session?.user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add items to your wishlist',
        variant: 'error',
      });
      router.push('/auth');
      return;
    }

    setIsTogglingWishlist(true);

    try {
      if (isWishlisted && wishlistItemId) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist/${wishlistItemId}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to remove from wishlist');
        }

        setIsWishlisted(false);
        setWishlistItemId(null);
        toast({
          title: 'Removed from wishlist',
          description: 'Product removed from your wishlist',
        });
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            productId: product.id,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to add to wishlist');
        }

        setIsWishlisted(true);
        setWishlistItemId(result.data.id);
        toast({
          title: 'Added to wishlist',
          description: result.message || 'Product added to your wishlist',
        });
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update wishlist',
        variant: 'error',
      });
    } finally {
      setIsTogglingWishlist(false);
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
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
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
                disabled={isCheckingWishlist || isTogglingWishlist}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {isTogglingWishlist ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart 
                    className={`w-4 h-4 transition-all duration-200 ${
                      isWishlisted ? 'fill-red-500 text-red-500' : ''
                    }`} 
                  />
                )}
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