'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import ProductCard from '@/components/product-card';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  image: string;
  images: string[];
  colors: string[];
  materials: string | null;
  featured: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  collection?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  rating: number;
  reviewCount: number ;
}

interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date | string;
  product: Product;
}

export default function WishlistPage() {
  const router = useRouter();
  const { user } = useCart();
  const { toast } = useToast();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    loadWishlist();
  }, [user, router]);

  const loadWishlist = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/wishlist?userId=${user.id}`);
      const result = await response.json();

      if (result.success) {
        setWishlist(result.data || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load wishlist',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wishlist',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (wishlistItemId: string) => {
    setRemovingId(wishlistItemId);
    try {
      const response = await fetch(`/api/wishlist/${wishlistItemId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setWishlist(prev => prev.filter(item => item.id !== wishlistItemId));
        toast({
          title: 'Removed',
          description: 'Item removed from wishlist',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to remove item',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'error',
      });
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearWishlist = async () => {
    if (!confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }

    try {
      // Remove all items one by one
      await Promise.all(
        wishlist.map(item => 
          fetch(`/api/wishlist/${item.id}`, { method: 'DELETE' })
        )
      );
      
      setWishlist([]);
      toast({
        title: 'Cleared',
        description: 'Wishlist has been cleared',
      });
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear wishlist',
        variant: 'error',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C47456]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-5xl font-bold text-[#2C2C2C] mb-2">My Wishlist</h1>
            {wishlist.length > 0 && (
              <p className="text-gray-600">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          {wishlist.length > 0 && (
            <Button
              onClick={handleClearWishlist}
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:border-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Start adding products you love to your wishlist</p>
            <Button onClick={() => router.push('/products')} className="bg-[#2C2C2C]">
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlist.map((item) => (
              <div key={item.id} className="relative">
                <ProductCard product={item.product} />
                <Button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={removingId === item.id}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-white hover:bg-red-50 text-red-600 rounded-full p-2 shadow-md"
                >
                  {removingId === item.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}