'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface GeoapifyAutocompleteProps {
  onAddressSelect: (address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }) => void;
  defaultValue?: string;
  placeholder?: string;
}

interface GeoapifyResult {
  properties: {
    formatted: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

export default function GeoapifyAutocomplete({
  onAddressSelect,
  defaultValue = '',
  placeholder = 'Start typing your address...',
}: GeoapifyAutocompleteProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<GeoapifyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Get free API key from: https://www.geoapify.com/
  const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || '';

  useEffect(() => {
    if (inputValue.length < 3) {
      setSuggestions([]);
      return;
    }

    // Debounce API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            inputValue
          )}&filter=countrycode:in&apiKey=${API_KEY}`
        );

        const data = await response.json();
        setSuggestions(data.features || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [inputValue, API_KEY]);

  const handleSelectSuggestion = (result: GeoapifyResult) => {
    const props = result.properties;
    
    setInputValue(props.formatted);
    setShowSuggestions(false);

    onAddressSelect({
      street: props.address_line1 || props.formatted,
      city: props.city || '',
      state: props.state || '',
      postalCode: props.postcode || '',
      country: props.country || 'India',
    });
  };

  return (
    <div className="space-y-1">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
        <input
          type="text"
          className="w-full border rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#C47456]"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((result, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                onClick={() => handleSelectSuggestion(result)}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {result.properties.formatted}
                    </p>
                    {result.properties.postcode && (
                      <p className="text-xs text-gray-500 mt-1">
                        PIN: {result.properties.postcode}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Click outside to close */}
        {showSuggestions && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowSuggestions(false)}
          />
        )}
      </div>

      <p className="text-xs text-gray-500">
        {inputValue.length < 3
          ? 'Type at least 3 characters'
          : 'Select from suggestions or continue typing'}
      </p>
    </div>
  );
}