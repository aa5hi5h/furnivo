'use client';

import { useState } from 'react';
import { Heart, Loader } from 'lucide-react';

interface WishlistButtonProps {
  productId: string;
  userId?: string;
  productName: string;
  isInWishlist?: boolean;
  onWishlistChange?: (isAdded: boolean) => void;
}

export default function WishlistButton({
  productId,
  userId,
  productName,
  isInWishlist = false,
  onWishlistChange,
}: WishlistButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [inWishlist, setInWishlist] = useState(isInWishlist);
  const [message, setMessage] = useState('');

  const handleAddToWishlist = async () => {
    if (!userId) {
      setMessage('Please log in to add items to wishlist');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId }),
      });

      const data = await response.json();

      if (response.ok) {
        setInWishlist(true);
        setMessage(data.message || `${productName} added to wishlist!`);
        onWishlistChange?.(true);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to add to wishlist');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      setMessage('Failed to add to wishlist');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleAddToWishlist}
        disabled={isAdding || inWishlist}
        className="flex items-center justify-center gap-2 px-6 py-2 border-2 border-[#C47456] text-[#C47456] rounded hover:bg-[#C47456] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isAdding ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        )}
        {inWishlist ? 'Added to Wishlist' : 'Add to Wishlist'}
      </button>
      {message && <p className="text-sm text-center text-gray-600">{message}</p>}
    </div>
  );
}