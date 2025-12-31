'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';

type Product = {
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
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    priceRanges: [] as string[],
    colors: [] as string[],
  });
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, sortBy, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data);
        setFilteredProducts(result.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((p) =>
        filters.categories.includes(p.category)
      );
    }

    // Price range filter
    if (filters.priceRanges.length > 0) {
      filtered = filtered.filter((p) => {
        return filters.priceRanges.some((range) => {
          switch (range) {
            case 'under-20000':
              return p.price < 20000;
            case '20000-50000':
              return p.price >= 20000 && p.price <= 50000;
            case '50000-100000':
              return p.price >= 50000 && p.price <= 100000;
            case 'above-100000':
              return p.price > 100000;
            default:
              return true;
          }
        });
      });
    }

    // Color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter((p) =>
        p.colors.some((color) => filters.colors.includes(color))
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Featured first
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    setFilteredProducts(filtered);
  };

  const toggleFilter = (type: 'categories' | 'priceRanges' | 'colors', value: string) => {
    setFilters((prev) => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      
      return { ...prev, [type]: updated };
    });
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRanges: [],
      colors: [],
    });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.priceRanges.length > 0 ||
    filters.colors.length > 0;

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-96 mb-12"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="font-serif text-5xl font-bold text-[#2C2C2C] mb-4">All Products</h1>
          <p className="text-gray-600 text-lg">Discover our complete collection of premium furniture</p>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              {/* Category Filter */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Category</h3>
                <div className="space-y-2">
                  {['Living Room', 'Bedroom', 'Dining', 'Office', 'Outdoor'].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={filters.categories.includes(cat)}
                        onChange={() => toggleFilter('categories', cat)}
                      />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Price Range</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Under ₹20,000', value: 'under-20000' },
                    { label: '₹20,000 - ₹50,000', value: '20000-50000' },
                    { label: '₹50,000 - ₹100,000', value: '50000-100000' },
                    { label: 'Above ₹100,000', value: 'above-100000' },
                  ].map((range) => (
                    <label key={range.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={filters.priceRanges.includes(range.value)}
                        onChange={() => toggleFilter('priceRanges', range.value)}
                      />
                      <span className="text-sm">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {['beige', 'grey', 'brown', 'black', 'white', 'teal'].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        filters.colors.includes(color)
                          ? 'border-[#C47456] ring-2 ring-[#C47456] ring-offset-2'
                          : 'border-gray-300 hover:border-[#C47456]'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                      onClick={() => toggleFilter('colors', color)}
                    />
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <p className="text-gray-600">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                {hasActiveFilters && ` (filtered from ${products.length})`}
              </p>
              <select
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-600 mb-4">
                  {hasActiveFilters
                    ? 'No products match your filters'
                    : 'No products found'}
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters}>Clear Filters</Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}