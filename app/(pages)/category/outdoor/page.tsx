'use client';

import { useState, useEffect } from 'react';
import { CategoryHero } from '@/components/category-hero';
import { FilterSidebar, type FilterState } from '@/components/filter-sidebar';
import { QuickViewModal } from '@/components/quick-view-modal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Heart, Shuffle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  images: string[];
  colors?: string[];
  rating: number;
  review_count: number;
  stock: number;
  created_at?: string;
  materials?: string[];
}

const CATEGORY_NAME = 'Outdoor';
const OUTDOOR_PRODUCTS = [
  'Outdoor Sofas & Sectionals',
  'Outdoor Dining Sets',
  'Lounge Chairs & Chaise',
  'Outdoor Tables',
  'Outdoor Chairs',
  'Umbrellas & Shade',
  'Fire Pits & Heaters',
  'Outdoor Storage',
];

export default function OutdoorPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const [gridColumns, setGridColumns] = useState(3);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', CATEGORY_NAME)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data || []) as Product[]);
      setFilteredProducts((data || []) as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({ title: 'Error', description: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...products];

    if (filters.categories.length > 0) {
      filtered = filtered.filter(p =>
        filters.categories.some(cat => p.name?.toLowerCase().includes(cat.toLowerCase()))
      );
    }

    if (filters.materials.length > 0) {
      filtered = filtered.filter(p =>
        filters.materials?.some(mat => p.materials?.includes(mat))
      );
    }

    if (filters.colors.length > 0) {
      filtered = filtered.filter(p =>
        filters.colors.some(col => p.colors?.includes(col))
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
        sorted.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      case 'best-selling':
        sorted.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
        break;
      case 'featured':
      default:
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

  const handleAddToWishlist = (productId: string) => {
    toast({ title: 'Added to wishlist', description: 'Product saved to wishlist' });
  };

  return (
    <div className="min-h-screen bg-white">
      <CategoryHero
        title="Outdoor"
        subtitle="Extend your living space. Weather-resistant furniture for every season."
        backgroundImage="https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=1600"
        breadcrumb="Home > Outdoor"
      />

      <div className="max-w-7xl mx-auto">
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
              categories={OUTDOOR_PRODUCTS}
              onFilterChange={handleFilterChange}
            />
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">No products found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6`}
                style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
              >
                {filteredProducts.map(product => {
                  const discount = product.original_price
                    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
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
                          <div className="w-full h-full bg-gray-200" />
                        )}

                        {discount > 0 && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                            -{discount}%
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => openQuickView(product)}
                            className="bg-white rounded-full p-3 hover:bg-[#C47456] hover:text-white transition-colors"
                            title="Quick View"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={() => handleAddToWishlist(product.id)}
                            className="bg-white rounded-full p-3 hover:bg-[#C47456] hover:text-white transition-colors"
                            title="Add to Wishlist"
                          >
                            <Heart size={20} />
                          </button>
                          <button
                            className="bg-white rounded-full p-3 hover:bg-[#C47456] hover:text-white transition-colors"
                            title="Compare"
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

                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-xs ${
                                i < Math.floor(product.rating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="text-xs text-gray-600 ml-1">
                            ({product.review_count})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-bold text-gray-900">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          {product.original_price && (
                            <span className="text-sm text-gray-400 line-through">
                              ₹{product.original_price.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {product.colors && product.colors.length > 0 && (
                          <div className="flex gap-2 mb-4">
                            {product.colors.slice(0, 3).map(color => (
                              <div
                                key={color}
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        )}

                        <p className={`text-xs font-semibold mb-3 ${
                          product.stock > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </p>

                        <Button
                          onClick={() => handleAddToCart(product.id, '', 1)}
                          disabled={product.stock === 0}
                          className="w-full bg-[#2C2C2C] hover:bg-[#C47456] text-white mt-auto"
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  );
                })}
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