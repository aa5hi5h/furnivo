'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';
import { QuickViewModal } from '@/components/quick-view-modal';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  images: string[];
  colors?: string[];
  stock: number;
  rating: number; // Changed from optional to required
  review_count: number; // Changed from optional to required
  createdAt: Date | string;
  updatedAt: Date | string;
}

export default function SalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('all');
  const [sortBy, setSortBy] = useState('discount');
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, minutes: 23 });
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchSaleProducts();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes } = prev;
        if (minutes > 0) {
          minutes--;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
        }
        return { days, hours, minutes };
      });
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const fetchSaleProducts = async () => {
    try {
      setLoading(true);
      // Fetch products with originalPrice (sale items)
      const response = await fetch('/api/products?hasDiscount=true');
      const result = await response.json();

      if (result.success) {
        setProducts(result.data || []);
        setFilteredProducts(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({ title: 'Error', description: 'Failed to load sale products', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountPercentage = (price: number, originalPrice?: number | null): number => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const handleFilterRange = (range: string) => {
    setSelectedRange(range);
    let filtered = [...products];

    if (range !== 'all') {
      const [min, max] = range.split('-').map(Number);
      filtered = filtered.filter(p => {
        const discount = calculateDiscountPercentage(p.price, p.originalPrice);
        return discount >= min && discount <= max;
      });
    }

    applySorting(filtered);
  };

  const applySorting = (items: Product[]) => {
    let sorted = [...items];
    switch (sortBy) {
      case 'discount':
        sorted.sort((a, b) => {
          const discountA = calculateDiscountPercentage(a.price, a.originalPrice);
          const discountB = calculateDiscountPercentage(b.price, b.originalPrice);
          return discountB - discountA;
        });
        break;
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
    }
    setFilteredProducts(sorted);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    applySorting(filteredProducts);
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
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#2C2C2C] to-[#C47456] text-white py-16 text-center">
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4">
          SALE - UP TO 50% OFF
        </h1>
        <p className="text-xl md:text-2xl mb-8">Limited time only!</p>

        {/* Countdown Timer */}
        <div className="flex justify-center gap-8 mb-8">
          {[
            { label: 'DAYS', value: timeLeft.days },
            { label: 'HOURS', value: timeLeft.hours },
            { label: 'MINUTES', value: timeLeft.minutes },
          ].map(item => (
            <div key={item.label} className="bg-white/10 rounded-lg p-4 min-w-24">
              <div className="text-4xl font-bold">{String(item.value).padStart(2, '0')}</div>
              <div className="text-sm uppercase tracking-wider mt-2">{item.label}</div>
            </div>
          ))}
        </div>

        <Button className="bg-white text-[#C47456] hover:bg-gray-100 text-lg px-8 py-6">
          Shop Now
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
          {[
            { label: 'All Sale Items', value: 'all' },
            { label: 'Up to 20% Off', value: '0-20' },
            { label: '20-35% Off', value: '20-35' },
            { label: '35-50% Off', value: '35-50' },
            { label: 'Over 50% Off', value: '50-100' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => handleFilterRange(tab.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedRange === tab.value
                  ? 'bg-[#C47456] text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort and View */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-sm text-gray-600">
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </span>
          <Select value={sortBy} onValueChange={handleSort}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="discount">Highest Discount</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C47456]"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No products found in this discount range.</p>
              <Button onClick={() => handleFilterRange('all')} variant="outline">
                View All Sale Items
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const discount = calculateDiscountPercentage(product.price, product.originalPrice);

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
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}

                      {/* Discount Badge - Large */}
                      {discount > 0 && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-2 rounded-full text-center">
                          <div className="font-bold text-lg">{discount}%</div>
                          <div className="text-xs">OFF</div>
                        </div>
                      )}

                      {product.stock < 10 && product.stock > 0 && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 rounded text-xs font-bold">
                          LIMITED STOCK
                        </div>
                      )}

                      {product.stock === 0 && (
                        <div className="absolute top-3 left-3 bg-gray-900 text-white px-2 py-1 rounded text-xs font-bold">
                          OUT OF STOCK
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
                          className="bg-white rounded-full p-3 hover:bg-[#C47456] hover:text-white transition-colors"
                          aria-label="Add to wishlist"
                        >
                          <Heart size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                        <Link href={`/products/${product.slug}`} className="hover:text-[#C47456]">
                          {product.name}
                        </Link>
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-bold text-red-600 text-lg">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {discount > 0 && (
                        <p className="text-green-600 text-xs mb-3">
                          Save ₹{((product.originalPrice || 0) - product.price).toLocaleString('en-IN')}
                        </p>
                      )}

                      <Button
                        onClick={() => handleAddToCart(product.id, '', 1)}
                        disabled={product.stock === 0}
                        className="w-full bg-[#2C2C2C] hover:bg-[#C47456] text-white mt-auto disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart size={18} className="mr-2" />
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Promotional Banner Every 12 Products */}
            {filteredProducts.length > 12 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className="bg-gradient-to-r from-[#C47456] to-[#2C2C2C] text-white p-8 rounded-lg flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-2">Free Delivery</h3>
                  <p>On all orders above ₹50,000</p>
                </div>
                <div className="bg-gradient-to-r from-[#2C2C2C] to-[#C47456] text-white p-8 rounded-lg flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-2">Extended Returns</h3>
                  <p>60 days return policy during sale</p>
                </div>
              </div>
            )}
          </>
        )}
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