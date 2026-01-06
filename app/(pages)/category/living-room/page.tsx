'use client';

import { useState, useEffect } from 'react';
import { CategoryHero } from '@/components/category-hero';
import { FilterSidebar, type FilterState } from '@/components/filter-sidebar';
import { QuickViewModal } from '@/components/quick-view-modal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Heart, Shuffle } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
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
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    fetchProducts();
  }, []);

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
      toast({ 
        title: 'Error', 
        description: 'Failed to load products',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...products];

    // Filter by subcategories
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p =>
        filters.categories.some(cat => 
          p.name?.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    // Filter by materials
    if (filters.materials.length > 0) {
      filtered = filtered.filter(p =>
        filters.materials.some(mat => 
          p.materials?.toLowerCase().includes(mat.toLowerCase())
        )
      );
    }

    // Filter by colors
    if (filters.colors.length > 0) {
      filtered = filtered.filter(p =>
        filters.colors.some(col => 
          p.colors?.some(pColor => 
            pColor.toLowerCase().includes(col.toLowerCase())
          )
        )
      );
    }

    // Filter by styles
    if (filters.styles && filters.styles.length > 0) {
      filtered = filtered.filter(p =>
        filters.styles.some((style: string) => 
          p.name?.toLowerCase().includes(style.toLowerCase())
        )
      );
    }

    // Filter by price range
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

  const handleAddToCart = (productId: string, color: string, quantity: number) => {
    addToCart(productId, quantity, color);
    toast({ title: 'Added to cart', description: 'Product added successfully' });
  };

  const handleAddToWishlist = async (productId: string) => {
    if (!session?.user?.id) {
      toast({ 
        title: 'Authentication required', 
        description: 'Please sign in to add items to your wishlist',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: session.user.id, 
          productId 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to wishlist');
      }

      toast({ 
        title: 'Success', 
        description: data.message || 'Added to wishlist' 
      });
    } catch (error: any) {
      console.error('Wishlist error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to add to wishlist',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <CategoryHero
        title="Living Room"
        subtitle="Create spaces that bring people together. From statement sofas to elegant coffee tables."
        backgroundImage="https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=1600"
        breadcrumb="Home > Living Room"
      />

      <div className="max-w-7xl mx-auto">
        {/* Filter Bar */}
        <div className="sticky top-20 bg-white border-b border-gray-200 z-40 py-4">
          <div className="flex items-center justify-between px-4 lg:px-0">
            <span className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </span>
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={handleSort}>
                <SelectTrigger className="w-48">
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

              <div className="flex gap-2">
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
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar
              categories={LIVING_ROOM_PRODUCTS}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Products Grid */}
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
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6`}
                style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
              >
                {filteredProducts.map(product => {
                  const discount = product.originalPrice
                    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                    : 0;

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
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                            -{discount}%
                          </div>
                        )}

                        {product.stock === 0 && (
                          <div className="absolute top-3 left-3 bg-gray-800 text-white px-2 py-1 rounded text-sm font-bold">
                            Out of Stock
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
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
                            className="bg-white rounded-full p-3 hover:bg-[#C47456] hover:text-white transition-colors"
                            title="Add to Wishlist"
                            aria-label="Add to wishlist"
                          >
                            <Heart size={20} />
                          </button>
                          <button
                            className="bg-white rounded-full p-3 hover:bg-[#C47456] hover:text-white transition-colors"
                            title="Compare"
                            aria-label="Compare"
                          >
                            <Shuffle size={20} />
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

            {/* Pagination */}
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

      <QuickViewModal
        product={quickViewProduct}
        open={showQuickView}
        onClose={() => setShowQuickView(false)}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleAddToWishlist}
      />
    </div>
  );
}