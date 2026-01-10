'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Share2, Trash2, Loader } from 'lucide-react';
import WishlistShareModal from './WishlistShareModal';

interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  rating?: number;
  reviewCount?: number;
  collection?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface WishlistItem {
  id: string;
  product: Product;
  createdAt: string;
}

interface WishlistPageProps {
  userId: string;
  userName: string;
}

export default function WishlistPage({ userId, userName }: WishlistPageProps) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, [userId]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch(`/api/wishlist?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setItems(data.data || []);
      }
    } catch (error) {
      console.error('Fetch wishlist error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    setRemovingId(itemId);
    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setItems(items.filter((item) => item.id !== itemId));
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        {items.length > 0 && (
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#C47456] text-white rounded hover:bg-[#B65A45] transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share Wishlist
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">Your wishlist is empty</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-[#C47456] text-white rounded hover:bg-[#B65A45] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">{items.length} item(s) in your wishlist</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link href={`/products/${item.product.slug}`}>
                  <div className="relative w-full h-48 bg-gray-100">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-[#C47456]">
                      {item.product.name}
                    </h3>
                  </Link>

                  {item.product.collection && (
                    <p className="text-xs text-gray-500 mb-2">
                      {item.product.collection.name}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-[#C47456]">
                      ${item.product.price}
                    </span>
                    {item.product.rating && (
                      <span className="text-sm text-yellow-500">
                        ★ {item.product.rating}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mb-4">
                    Added {new Date(item.createdAt).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="flex-1 text-center px-3 py-2 border border-[#C47456] text-[#C47456] rounded hover:bg-[#C47456] hover:text-white transition-colors text-sm font-medium"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={removingId === item.id}
                      className="px-3 py-2 text-red-500 border border-red-500 rounded hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      {removingId === item.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showShareModal && (
        <WishlistShareModal
          items={items}
          userName={userName}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}