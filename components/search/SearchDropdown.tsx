'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Loader, X } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  category: string;
  rating?: number;
}

export default function SearchDropdown() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success) {
          setResults(data.data || []);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

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

  // Prevent body scroll when dropdown is open on mobile
  useEffect(() => {
    if (showDropdown && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDropdown]);

  const closeSearch = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <>
      <div ref={searchRef} className="relative w-full">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
            className="w-full pl-4 pr-10 py-2 md:py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#C47456] text-sm md:text-base"
          />
          {loading ? (
            <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Desktop Dropdown - stays under search bar */}
        {showDropdown && (
          <div className="hidden md:block absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={closeSearch}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="w-16 h-16 relative flex-shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-base font-semibold text-[#C47456]">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.rating && (
                        <span className="text-sm text-yellow-500">★ {product.rating}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : query.trim().length >= 2 && !loading ? (
              <div className="p-4 text-center text-gray-500">No products found</div>
            ) : null}
          </div>
        )}
      </div>

      {/* Mobile Full Screen Overlay */}
      {showDropdown && (
        <div className="md:hidden fixed inset-0 bg-white z-[100] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#C47456]"
              />
              {loading ? (
                <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
              ) : (
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              )}
            </div>
            <button
              onClick={closeSearch}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4">
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={closeSearch}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors"
                  >
                    <div className="w-20 h-20 relative flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-base text-gray-900 line-clamp-2 mb-1">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-[#C47456]">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.rating && (
                          <span className="text-sm text-yellow-500">★ {product.rating}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : query.trim().length >= 2 && !loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-2">Try searching with different keywords</p>
              </div>
            ) : query.trim().length < 2 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Start typing to search</p>
                <p className="text-gray-400 text-sm mt-2">Enter at least 2 characters</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}