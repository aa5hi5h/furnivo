'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Loader, AlertCircle, Eye, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  rating?: number;
  featured: boolean;
}

interface AdminSearchBarProps {
  onEdit?: (productId: string) => void;
  onDelete?: (productId: string) => void;
}

export default function AdminSearchBar({ onEdit, onDelete }: AdminSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out'>('all');
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (query.trim().length < 1) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/admin/search?q=${encodeURIComponent(query)}&stock=${filterStock}`
        );
        const data = await response.json();
        
        if (data.success) {
          setResults(data.data || []);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Admin search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, filterStock]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'red' };
    if (stock <= 10) return { label: 'Low Stock', color: 'yellow' };
    return { label: 'In Stock', color: 'green' };
  };

  return (
    <div ref={searchRef} className="w-full">
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search products by name, category, or ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 1 && setShowDropdown(true)}
            className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {loading ? (
            <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Stock Filter */}
        {query.trim().length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStock('all')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filterStock === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStock('low')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filterStock === 'low'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Low Stock (≤10)
            </button>
            <button
              onClick={() => setFilterStock('out')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filterStock === 'out'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Out of Stock
            </button>
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {results.map((product) => {
            const status = getStockStatus(product.stock);
            const discount = product.originalPrice
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;

            return (
              <div
                key={product.id}
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="p-3 flex items-center gap-3">
                  {/* Product Image */}
                  <div className="w-12 h-12 relative flex-shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {product.name}
                      </p>
                      {product.featured && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mb-2">
                      {product.category} • ID: {product.id.slice(0, 8)}...
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-900">${product.price}</span>
                        {product.originalPrice && (
                          <span className="ml-2 text-gray-500 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="ml-2 text-red-600 font-semibold">
                            -{discount}%
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-white font-semibold bg-${status.color}-500`}>
                        {product.stock} units
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      href={`/products/${product.slug}`}
                      target="_blank"
                      className="p-2 hover:bg-blue-100 rounded transition-colors text-blue-600"
                      title="View product"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {
                        onEdit?.(product.id);
                        setShowDropdown(false);
                      }}
                      className="p-2 hover:bg-yellow-100 rounded transition-colors text-yellow-600"
                      title="Edit product"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        onDelete?.(product.id);
                        setShowDropdown(false);
                      }}
                      className="p-2 hover:bg-red-100 rounded transition-colors text-red-600"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {showDropdown && query.trim().length >= 1 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p>No products found</p>
          <p className="text-xs mt-1">Try different search terms</p>
        </div>
      )}
    </div>
  );
}