'use client';

import { useState, useEffect } from 'react';
import { CategoryHero } from '@/components/category-hero';
import { FilterSidebar, type FilterState } from '@/components/filter-sidebar';
import { QuickViewModal } from '@/components/quick-view-modal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Eye, Heart, ShoppingCart, Shuffle } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import LivingRoomImage from "../../../../public/modern-living-room-debra-ackerbloom-interiors-llc-img~c971036c0bdc4f53_14-9822-1-a92e8d5.jpg"


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
  createdAt: string;
  materials?: string | null;
  category: string;
  description?: string | null;
  featured: boolean;
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const CATEGORY_NAME = 'Living Room';
const LIVING_ROOM_PRODUCTS = [
  'Sofas & Sectionals',
  'Armchairs & Accent Chairs',
  'Coffee Tables',
  'TV Stands & Media Consoles',
  'Bookcases & Shelving',
  'Side Tables',
  'Ottomans & Benches',
];

export default function LivingRoomPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const [gridColumns, setGridColumns] = useState(3);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [wishlistItemIds, setWishlistItemIds] = useState<Record<string, string>>({});
  const { addToCart, items: cartItems } = useCart();
  const { data: session } = useSession();

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?category=${encodeURIComponent(CATEGORY_NAME)}&limit=100`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data: ProductsResponse = await response.json();
      setProducts(data.data || []);
      setFilteredProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...products];

    if (filters.categories.length > 0) {
      filtered = filtered.filter(p =>
        filters.categories.some(cat => 
          p.name?.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    if (filters.materials.length > 0) {
      filtered = filtered.filter(p =>
        filters.materials.some(mat => 
          p.materials?.toLowerCase().includes(mat.toLowerCase())
        )
      );
    }

    if (filters.colors.length > 0) {
      filtered = filtered.filter(p =>
        filters.colors.some(col => 
          p.colors?.some(pColor => 
            pColor.toLowerCase().includes(col.toLowerCase())
          )
        )
      );
    }

    if (filters.styles && filters.styles.length > 0) {
      filtered = filtered.filter(p =>
        filters.styles.some((style: string) => 
          p.name?.toLowerCase().includes(style.toLowerCase())
        )
      );
    }

    filtered = filtered.filter(
      p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    applySorting(filtered, sortBy);
    setFilteredProducts(filtered);
  };

  const applySorting = (items: Product[], sort: string) => {
    let sorted = [...items];
    switch (sort) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'best-selling':
        sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case 'featured':
      default:
        sorted.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        break;
    }
    setFilteredProducts(sorted);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    applySorting(filteredProducts, value);
  };

  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  };

  const isInCart = (productId: string) => {
    return cartItems.some(item => item.productId === productId);
  };

  const handleAddToCart = (productId: string, color: string, quantity: number) => {
    addToCart(productId, quantity, color);
    toast.success('Product added to cart successfully');
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
      console.error('Wishlist error:', error);
      toast.error(error.message || 'Failed to update wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <CategoryHero
        title="Living Room"
        subtitle="Create spaces that bring people together. From statement sofas to elegant coffee tables."
        backgroundImage={LivingRoomImage}
        breadcrumb="Home > Living Room"
      />

      <div className="max-w-7xl mx-auto">
        <div className="sticky top-20 bg-white border-b border-gray-200 z-40 py-4">
          <div className="flex items-center justify-between px-4 lg:px-0">
            <span className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </span>
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={handleSort}>
              <SelectTrigger className="w-32 sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="best-selling">Best Selling</SelectItem>
                </SelectContent>
              </Select>

              <div className="hidden sm:flex gap-2">
                {[3, 4].map(cols => (
                  <button
                    key={cols}
                    onClick={() => setGridColumns(cols)}
                    className={`px-3 py-2 border rounded transition-colors ${
                      gridColumns === cols
                        ? 'bg-[#C47456] text-white border-[#C47456]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    aria-label={`${cols} columns`}
                  >
                    {cols}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-8 px-4 lg:px-0">
          <div className="lg:col-span-1">
            <FilterSidebar
              categories={LIVING_ROOM_PRODUCTS}
              onFilterChange={handleFilterChange}
            />
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading products...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <p className="text-gray-500 text-lg mb-4">No products found.</p>
                  <p className="text-gray-400 text-sm">Try adjusting your filters.</p>
                </div>
              </div>
            ) : (
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                style={{ 
                  gridTemplateColumns: window.innerWidth >= 1024 
                    ? `repeat(${gridColumns}, minmax(0, 1fr))` 
                    : undefined
                }}
              >
                {filteredProducts.map(product => {
                  const discount = product.originalPrice
                    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                    : 0;

                  const isWishlisted = !!wishlistItemIds[product.id];
                  const isProductInCart = isInCart(product.id);

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
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}

                        {discount > 0 && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold z-10">
                            -{discount}%
                          </div>
                        )}

                        {product.stock === 0 && (
                          <div className="absolute top-3 left-3 bg-gray-800 text-white px-2 py-1 rounded text-sm font-bold z-10">
                            Out of Stock
                          </div>
                        )}

                        {/* Mobile: Always visible buttons in center */}
                        <div className="absolute inset-0 bg-black/20 md:hidden z-10">
                          <div className="absolute inset-0 flex items-center justify-center gap-3">
                            <button
                              onClick={() => openQuickView(product)}
                              className="bg-white rounded-full p-3 hover:bg-[#C47456] hover:text-white transition-colors shadow-lg"
                              title="Quick View"
                              aria-label="Quick view"
                            >
                              <Eye size={20} />
                            </button>
                            <button
                              onClick={() => handleAddToWishlist(product.id)}
                              className={`bg-white rounded-full p-3 hover:bg-[#C47456] hover:text-white transition-colors shadow-lg ${
                                isWishlisted ? 'text-red-500' : ''
                              }`}
                              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                              <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                            </button>
                            <button
                              onClick={() => handleAddToCart(product.id, product.colors?.[0] || '', 1)}
                              disabled={product.stock === 0}
                              className={`rounded-full p-3 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                                isProductInCart
                                  ? 'bg-green-50 text-green-600'
                                  : 'bg-white hover:bg-[#C47456] hover:text-white'
                              }`}
                              title={isProductInCart ? 'Already in Cart' : 'Add to Cart'}
                              aria-label={isProductInCart ? 'Already in cart' : 'Add to cart'}
                            >
                              {isProductInCart ? (
                                <Check size={20} strokeWidth={3} />
                              ) : (
                                <ShoppingCart size={20} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Desktop: Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors hidden md:flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => openQuickView(product)}
                            className="bg-white rounded-full p-3 hover:bg-[#C47456] hover:text-white transition-colors"
                            title="Quick View"
                            aria-label="Quick view"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={() => handleAddToWishlist(product.id)}
                            className={`bg-white rounded-full p-3 hover:bg-[#C47456] hover:text-white transition-colors ${
                              isWishlisted ? 'text-red-500' : ''
                            }`}
                            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => handleAddToCart(product.id, product.colors?.[0] || '', 1)}
                            disabled={product.stock === 0}
                            className={`rounded-full p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              isProductInCart
                                ? 'bg-green-50 text-green-600'
                                : 'bg-white hover:bg-[#C47456] hover:text-white'
                            }`}
                            title={isProductInCart ? 'Already in Cart' : 'Add to Cart'}
                            aria-label={isProductInCart ? 'Already in cart' : 'Add to cart'}
                          >
                            {isProductInCart ? (
                              <Check size={20} strokeWidth={3} />
                            ) : (
                              <ShoppingCart size={20} />
                            )}
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
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-xs ${
                                  i < Math.floor(product.rating || 0)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="text-xs text-gray-600 ml-1">
                              ({product.reviewCount})
                            </span>
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

                        {product.colors && product.colors.length > 0 && (
                          <div className="flex gap-2 mb-4">
                            {product.colors.slice(0, 3).map((color, idx) => (
                              <div
                                key={idx}
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                            {product.colors.length > 3 && (
                              <span className="text-xs text-gray-500 flex items-center">
                                +{product.colors.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <p className={`text-xs font-semibold mb-3 ${
                          product.stock > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                        </p>

                        <Button
                          onClick={() => handleAddToCart(product.id, product.colors?.[0] || '', 1)}
                          disabled={product.stock === 0}
                          className="w-full bg-[#2C2C2C] hover:bg-[#C47456] text-white mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredProducts.length > 0 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button variant="outline" className="border-gray-300">Previous</Button>
                <Button variant="outline" className="bg-[#C47456] text-white border-[#C47456]">1</Button>
                <Button variant="outline" className="border-gray-300">2</Button>
                <Button variant="outline" className="border-gray-300">3</Button>
                <Button variant="outline" className="border-gray-300">Next</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal
          product={{
            ...quickViewProduct,
            review_count: quickViewProduct.reviewCount,
          } as any}
          open={showQuickView}
          onClose={() => setShowQuickView(false)}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
          wishlistItemIds = {wishlistItemIds}
        />
      )}
    </div>
  );
}