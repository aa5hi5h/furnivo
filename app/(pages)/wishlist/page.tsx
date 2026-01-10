'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/product-card';
import { Heart, Trash2, Share2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import WishlistShareModal from '@/components/wishlist/WishlistShareModal';

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
  reviewCount: number;
}

interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date | string;
  product: Product;
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    // If still loading session, do nothing
    if (status === 'loading') {
      return;
    }

    // If not authenticated, redirect
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }

    // If authenticated, load wishlist
    if (status === 'authenticated' && session?.user?.id) {
      loadWishlist(session.user.id);
    }
  }, [status, session, router]);

  const loadWishlist = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/wishlist?userId=${userId}`);
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

  // Show loading while session is being checked
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C47456]"></div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-5xl font-bold text-[#2C2C2C] mb-2">My Wishlist</h1>
            {wishlist.length > 0 && (
              <p className="text-gray-600">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          {wishlist.length > 0 && (
            <div className="flex gap-3">
              <Button
                onClick={() => setShowShareModal(true)}
                className="bg-[#C47456] hover:bg-[#B65A45] text-white flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Wishlist
              </Button>
              <Button
                onClick={handleClearWishlist}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:border-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Empty State */}
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
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlist.map((item) => (
              <div key={item.id} className="relative group">
                <ProductCard product={item.product} />
                <Button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={removingId === item.id}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-white hover:bg-red-50 text-red-600 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {removingId === item.id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <WishlistShareModal
          items={wishlist}
          userName={session?.user?.name || 'User'}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}