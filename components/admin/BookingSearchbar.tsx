'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, AlertCircle } from 'lucide-react';

interface DesignBooking {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  preferredDate: string | null;
  preferredTime: string | null;
  budgetRange: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

interface BookingSearchBarProps {
  bookings: DesignBooking[];
  onSelect?: (booking: DesignBooking) => void;
}

export default function BookingSearchBar({ bookings, onSelect }: BookingSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DesignBooking[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const searchQuery = query.toLowerCase();
    const filtered = bookings.filter(
      (booking) =>
        booking.name.toLowerCase().includes(searchQuery) ||
        booking.email.toLowerCase().includes(searchQuery) ||
        booking.phone.includes(searchQuery) ||
        booking.serviceType.toLowerCase().includes(searchQuery) ||
        booking.status.toLowerCase().includes(searchQuery)
    );

    setResults(filtered);
    setShowDropdown(filtered.length > 0);
  }, [query, bookings]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getServiceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'virtual':
        return '💻';
      case 'inhome':
        return '🏠';
      case 'fullroom':
        return '🛋️';
      default:
        return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
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
          placeholder="Search bookings by name, email, phone, or service type..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {results.map((booking) => (
            <div
              key={booking.id}
              onClick={() => {
                onSelect?.(booking);
                setShowDropdown(false);
              }}
              className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{booking.name}</p>
                  <p className="text-xs text-gray-500">{booking.email}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p><span className="font-medium">Service:</span> {getServiceIcon(booking.serviceType)} {booking.serviceType}</p>
                <p><span className="font-medium">Phone:</span> {booking.phone}</p>
                {booking.preferredDate && (
                  <p><span className="font-medium">Date:</span> {new Date(booking.preferredDate).toLocaleDateString()}</p>
                )}
                {booking.budgetRange && (
                  <p><span className="font-medium">Budget:</span> {booking.budgetRange}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && query.trim().length >= 1 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p>No bookings found</p>
        </div>
      )}
    </div>
  );
}