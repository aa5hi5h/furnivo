'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader, AlertCircle } from 'lucide-react';

interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  paymentMethod: string | null;
  createdAt: string;
  user?: {
    name: string | null;
    email: string;
  };
}

interface OrderSearchBarProps {
  orders: Order[];
  onSelect?: (order: Order) => void;
}

export default function OrderSearchBar({ orders, onSelect }: OrderSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Order[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const searchQuery = query.toLowerCase();
    const filtered = orders.filter(
      (order) =>
        order.id.toLowerCase().includes(searchQuery) ||
        order.user?.email?.toLowerCase().includes(searchQuery) ||
        order.user?.name?.toLowerCase().includes(searchQuery) ||
        order.status.toLowerCase().includes(searchQuery)
    );

    setResults(filtered);
    setShowDropdown(filtered.length > 0);
  }, [query, orders]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div ref={searchRef} className="w-full relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Search orders by ID, email, name, or status..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {results.map((order) => (
            <div
              key={order.id}
              onClick={() => {
                onSelect?.(order);
                setShowDropdown(false);
              }}
              className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-gray-900">Order #{order.id.slice(0, 8)}</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p><span className="font-medium">Customer:</span> {order.user?.name || 'Unknown'}</p>
                <p><span className="font-medium">Email:</span> {order.user?.email}</p>
                <p><span className="font-medium">Total:</span> ₹{order.totalAmount.toLocaleString()}</p>
                <p><span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && query.trim().length >= 1 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p>No orders found</p>
        </div>
      )}
    </div>
  );
}