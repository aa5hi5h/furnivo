'use client';

import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  rating?: number;
  reviewCount?: number;
  collection?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface WishlistItem {
  id: string;
  product: Product;
  createdAt: string;
}

interface WishlistShareModalProps {
  items: WishlistItem[];
  userName: string;
  onClose: () => void;
}

export default function WishlistShareModal({
  items,
  userName,
  onClose,
}: WishlistShareModalProps) {
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const platforms = [
    { name: 'WhatsApp', icon: '💬', key: 'whatsapp' },
    { name: 'Facebook', icon: 'f', key: 'facebook' },
    { name: 'Twitter', icon: '𝕏', key: 'twitter' },
    { name: 'Email', icon: '✉️', key: 'email' },
  ];

  const generateShareMessage = () => {
    const productList = items
      .map((item) => `${item.product.name} - $${item.product.price}`)
      .join('\n');

    const message = `Check out my FURNIVO wishlist! 🛋️\n\n${productList}\n\nTotal: $${items.reduce((sum, item) => sum + item.product.price, 0).toFixed(2)}\n\nVisit FURNIVO: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wishlist`;

    return message;
  };

  const handleShare = (platform: string) => {
    setSharing(true);
    const message = generateShareMessage();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    let shareUrl = '';

    switch (platform.toLowerCase()) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(message)}&hashtag=%23Furnivo`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Check out my FURNIVO wishlist&body=${encodeURIComponent(message)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
      setCopiedPlatform(platform);
      setTimeout(() => {
        setCopiedPlatform(null);
        setSharing(false);
      }, 2000);
    }
  };

  const totalPrice = items.reduce((sum, item) => sum + item.product.price, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Share Your Wishlist</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">
            <strong>{items.length}</strong> item(s) • Total:{' '}
            <strong>${totalPrice.toFixed(2)}</strong>
          </p>
          <div className="text-xs text-gray-500 max-h-24 overflow-y-auto space-y-1">
            {items.map((item) => (
              <p key={item.id}>{item.product.name}</p>
            ))}
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {platforms.map((platform) => (
            <button
              key={platform.key}
              onClick={() => handleShare(platform.key)}
              disabled={sharing}
              className="flex flex-col items-center justify-center gap-2 p-3 border border-gray-200 rounded hover:border-[#C47456] hover:bg-orange-50 transition-colors disabled:opacity-50"
            >
              {copiedPlatform === platform.key ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <span className="text-2xl">{platform.icon}</span>
              )}
              <span className="text-xs font-medium text-center">{platform.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}