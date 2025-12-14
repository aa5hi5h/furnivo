'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { supabase, type Product } from '@/lib/supabase';
import ProductCard from '@/components/product-card';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const router = useRouter();
  const { user } = useCart();
  const [wishlist, setWishlist] = useState<(Product & { wishlist_id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('wishlist')
      .select('id, product:products(*)')
      .eq('user_id', user.id);

    if (data) {
      const products = data.map((item: any) => ({
        ...item.product,
        wishlist_id: item.id,
      }));
      setWishlist(products);
    }
    setLoading(false);
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
        <h1 className="font-serif text-5xl font-bold text-[#2C2C2C] mb-8">My Wishlist</h1>

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
          <div>
            <p className="text-gray-600 mb-8">{wishlist.length} items</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {wishlist.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
