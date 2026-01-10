'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, AlertCircle } from 'lucide-react';

interface Customer {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  totalOrders: number;
  totalReviews: number;
  totalSpent: number;
}

interface CustomerSearchBarProps {
  customers: Customer[];
  onSelect?: (customer: Customer) => void;
}

export default function CustomerSearchBar({ customers, onSelect }: CustomerSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const searchQuery = query.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        customer.email.toLowerCase().includes(searchQuery) ||
        customer.name?.toLowerCase().includes(searchQuery)
    );

    setResults(filtered);
    setShowDropdown(filtered.length > 0);
  }, [query, customers]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="w-full relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Search customers by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {results.map((customer) => (
            <div
              key={customer.id}
              onClick={() => {
                onSelect?.(customer);
                setShowDropdown(false);
              }}
              className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                {customer.image && (
                  <img
                    src={customer.image}
                    alt={customer.name || 'Customer'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{customer.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-600">
                    <span><span className="font-medium">Orders:</span> {customer.totalOrders}</span>
                    <span><span className="font-medium">Reviews:</span> {customer.totalReviews}</span>
                    <span><span className="font-medium">Spent:</span> ₹{customer.totalSpent.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && query.trim().length >= 1 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p>No customers found</p>
        </div>
      )}
    </div>
  );
}