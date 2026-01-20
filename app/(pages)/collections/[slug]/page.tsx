'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/cart-context';
import { QuickViewModal } from '@/components/quick-view-modal';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Product, Collection, CollectionWithProducts } from "../../../types/product"

export default function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [wishlistItemIds, setWishlistItemIds] = useState<Record<string, string>>({});
  const { addToCart } = useCart();
  const { data: session } = useSession();

  const { slug } = use(params);

  useEffect(() => {
    fetchCollectionAndProducts();
  }, [slug]);

  useEffect(() => {
    if (session?.user?.id) {
      checkWishlistStatus();
    }
  }, [session?.user?.id, products]);

  const checkWishlistStatus = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/wishlist?userId=${session.user.id}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const wishlistMap: Record<string, string> = {};
          result.data.forEach((item: any) => {
            wishlistMap[item.productId] = item.id;
          });
          setWishlistItemIds(wishlistMap);
        }
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const fetchCollectionAndProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/collections/${slug}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch collection');
      }

      const data: CollectionWithProducts = await response.json();
      
      setCollection({
        id: data.id,
        name: data.name,
        slug: data.slug,
        imageUrl: data.imageUrl,
        description: data.description,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
      
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = async (productId: string) => {
    if (!session?.user?.id) {
      toast.error('Please sign in to add items to your wishlist');
      return;
    }

    try {
      const wishlistItemId = wishlistItemIds[productId];

      if (wishlistItemId) {
        const response = await fetch(`/api/wishlist/${wishlistItemId}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to remove from wishlist');
        }

        const newWishlistMap = { ...wishlistItemIds };
        delete newWishlistMap[productId];
        setWishlistItemIds(newWishlistMap);

        toast.success('Removed from wishlist');
      } else {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: session.user.id, 
            productId 
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to add to wishlist');
        }

        setWishlistItemIds({
          ...wishlistItemIds,
          [productId]: result.data.id
        });

        toast.success('Product added to your wishlist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wishlist');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-light text-gray-900 mb-2">Collection not found</h2>
          <Link href="/collections" className="text-gray-600 hover:text-black underline">
            Browse all collections
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = (productId: string, color: string, quantity: number) => {
    addToCart(productId, quantity, color);
    toast.success('Product added to cart successfully');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Hero */}
      <div
        className="relative w-full h-[70vh] bg-cover bg-center"
        style={{ backgroundImage: `url('${collection.imageUrl}')` }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-6 left-6 text-white text-sm">
          <Link href="/" className="hover:opacity-60">Home</Link>
          {' / '}
          <Link href="/collections" className="hover:opacity-60">Collections</Link>
          {' / '}
          {collection.name}
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
          <h1 className="text-5xl md:text-6xl font-light text-white mb-4 tracking-tight">
            {collection.name}
          </h1>
          <p className="text-white text-lg max-w-xl opacity-90">
            {collection.description || 'Discover our curated collection'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* About Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 py-20 px-4 border-b">
          <div>
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              {collection.name}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {collection.description || 'Each piece is carefully crafted with attention to detail and quality materials.'}
            </p>
            <p className="text-gray-600 leading-relaxed">
              Timeless design meets modern craftsmanship in this carefully curated collection.
            </p>
          </div>
          <div className="bg-gray-100 aspect-video">
            <img
              src={collection.imageUrl}
              alt={collection.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Products Section */}
        <div id="products-section" className="py-20 px-4">
          <div className="flex justify-between items-center mb-12 pb-4 border-b">
            <h2 className="text-2xl font-light text-gray-900">
              {sortedProducts.length} {sortedProducts.length !== 1 ? 'items' : 'item'}
            </h2>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 border-0">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {sortedProducts.map(product => {
              const discount = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;

              const isWishlisted = !!wishlistItemIds[product.id];

              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative overflow-hidden bg-gray-100 aspect-square">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}

                    {discount > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                        -{discount}%
                      </div>
                    )}

                    {product.stock === 0 && (
                      <div className="absolute top-3 left-3 bg-gray-800 text-white px-2 py-1 rounded text-sm font-bold">
                        Out of Stock
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setQuickViewProduct(product);
                          setShowQuickView(true);
                        }}
                        className="bg-white rounded-full p-3 hover:bg-[#C47456] hover:text-white transition-colors"
                        aria-label="Quick view"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => handleAddToWishlist(product.id)}
                        className={`bg-white rounded-full p-3 hover:bg-[#C47456] hover:text-white transition-colors ${
                          isWishlisted ? 'text-red-500' : ''
                        }`}
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                      <Link href={`/products/${product.slug}`} className="hover:text-[#C47456]">
                        {product.name}
                      </Link>
                    </h3>

                    {product.rating && product.reviewCount ? (
                      <div className="flex items-center gap-1 mb-2 text-sm">
                        <span className="text-yellow-500">★</span>
                        <span className="text-gray-600">{product.rating.toFixed(1)}</span>
                        <span className="text-gray-400">({product.reviewCount})</span>
                      </div>
                    ) : null}

                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-gray-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product.id, product.colors?.[0] || '', 1)}
                      disabled={product.stock === 0}
                      className="w-full bg-[#2C2C2C] hover:bg-[#C47456] text-white mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart size={18} className="mr-2" />
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {sortedProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400">No products in this collection yet.</p>
            </div>
          )}
        </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal
          product={{
            ...quickViewProduct,
            review_count: quickViewProduct.reviewCount ?? quickViewProduct.review_count
          } as any}
          open={showQuickView}
          onClose={() => setShowQuickView(false)}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
        />
      )}
    </div>
  );
}