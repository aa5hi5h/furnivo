'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, X, ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface ColorVariant {
  color: string;
  colorCode?: string;
  images: string[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  description?: string;
  images: string[];
  colors?: string[];
  colorVariants?: ColorVariant[] | string;
  rating: number;
  review_count: number;
  stock: number;
}

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: (productId: string, color: string, quantity: number) => void;
  onAddToWishlist: (productId: string) => void;
  wishlistItemIds?: Record<string, string>;
}

export function QuickViewModal({
  product,
  open,
  onClose,
  onAddToCart,
  onAddToWishlist,
  wishlistItemIds = {},
}: QuickViewModalProps) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { data: session } = useSession();

  const THUMBNAILS_PER_VIEW = 6;

  // Parse color variants from product
  const colorVariants: ColorVariant[] = product?.colorVariants
    ? (Array.isArray(product.colorVariants)
        ? product.colorVariants
        : JSON.parse(product.colorVariants as string))
    : [];

  // Determine if product uses color variants or simple mode
  const hasColorVariants = colorVariants.length > 0;
  
  // Get current images based on mode
  const currentImages = hasColorVariants
    ? colorVariants[selectedColorIndex]?.images || []
    : product?.images || [];

  // Get current color name
  const currentColorName = hasColorVariants
    ? colorVariants[selectedColorIndex]?.color
    : '';

  const maxThumbnailIndex = Math.max(0, currentImages.length - THUMBNAILS_PER_VIEW);
  const visibleThumbnails = currentImages.slice(
    thumbnailStartIndex,
    thumbnailStartIndex + THUMBNAILS_PER_VIEW
  );

  useEffect(() => {
    if (product) {
      // Update wishlist state when modal opens or product changes
      setIsWishlisted(!!wishlistItemIds[product.id]);
      // Reset quantity, color, image, and thumbnail position when product changes
      setQuantity(1);
      setSelectedColorIndex(0);
      setSelectedImageIndex(0);
      setThumbnailStartIndex(0);
    }
  }, [product, wishlistItemIds, open]);

  if (!product) return null;

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    onAddToCart(product.id, currentColorName, quantity);
    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 500);
  };

  const handleWishlistClick = () => {
    if (!session?.user?.id) {
      alert('Please sign in to add items to your wishlist');
      return;
    }
    onAddToWishlist(product.id);
    setIsWishlisted(!isWishlisted);
  };

  const handleColorChange = (index: number) => {
    setSelectedColorIndex(index);
    setSelectedImageIndex(0); // Reset to first image when changing color
    setThumbnailStartIndex(0); // Reset thumbnail scroll when changing color
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? currentImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === currentImages.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevThumbnails = () => {
    setThumbnailStartIndex(Math.max(0, thumbnailStartIndex - 1));
  };

  const handleNextThumbnails = () => {
    setThumbnailStartIndex(Math.min(maxThumbnailIndex, thumbnailStartIndex + 1));
  };

  const currentImage = currentImages[selectedImageIndex] || product.images[0];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose className="absolute right-4 top-4 z-10" />
        <div className="flex flex-col">
          {/* Product Image with Navigation - Top */}
          <div className="relative flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden h-80 w-full mb-6">
            {currentImage ? (
              <>
                <img
                  src={currentImage}
                  alt={`${product.name} - ${currentColorName || 'Image'}`}
                  className="w-full h-full object-contain p-4"
                />
                
                {/* Image Navigation Arrows - Only show if multiple images */}
                {currentImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                      {selectedImageIndex + 1} / {currentImages.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
          </div>

          {/* Thumbnail Preview with Navigation - Only show if multiple images */}
          {currentImages.length > 1 && (
            <div className="relative mb-6 max-w-full">
              {/* Left Arrow for Thumbnails */}
              {currentImages.length > THUMBNAILS_PER_VIEW && (
                <button
                  onClick={handlePrevThumbnails}
                  disabled={thumbnailStartIndex === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {/* Thumbnails Container */}
              <div className="flex justify-center items-center mx-auto" style={{ maxWidth: '440px' }}>
                <div className="grid grid-cols-6 gap-2 w-full px-8">
                  {visibleThumbnails.map((image, index) => {
                    const actualIndex = thumbnailStartIndex + index;
                    return (
                      <button
                        key={actualIndex}
                        onClick={() => setSelectedImageIndex(actualIndex)}
                        className={`aspect-square w-full rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === actualIndex
                            ? 'border-[#C47456]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${actualIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Arrow for Thumbnails */}
              {currentImages.length > THUMBNAILS_PER_VIEW && (
                <button
                  onClick={handleNextThumbnails}
                  disabled={thumbnailStartIndex >= maxThumbnailIndex}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* Thumbnail Indicator Dots */}
              {currentImages.length > THUMBNAILS_PER_VIEW && (
                <div className="flex justify-center gap-1 mt-2">
                  {Array.from({ 
                    length: Math.ceil(currentImages.length / THUMBNAILS_PER_VIEW) 
                  }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all ${
                        Math.floor(thumbnailStartIndex / THUMBNAILS_PER_VIEW) === i
                          ? 'w-4 bg-[#C47456]'
                          : 'w-1.5 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Product Details - Bottom */}
          <div className="flex flex-col">
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating.toFixed(1)} ({product.review_count} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-bold text-gray-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.original_price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ₹{product.original_price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {product.description}
                </p>
              )}

              {/* Color Selection - Enhanced with variants */}
              {hasColorVariants && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Select Color {currentColorName && `- ${currentColorName}`}
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {colorVariants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorChange(index)}
                        className={`flex items-center gap-2 px-4 py-2 border-2 rounded transition-all text-sm font-medium ${
                          selectedColorIndex === index
                            ? 'border-[#C47456] bg-[#C47456]/10'
                            : 'border-gray-300 text-gray-700 hover:border-[#C47456]'
                        }`}
                      >
                        {variant.colorCode && (
                          <div
                            className="w-4 h-4 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: variant.colorCode }}
                          />
                        )}
                        <span className="capitalize">{variant.color}</span>
                        <span className="text-xs text-gray-500">({variant.images.length})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback for old format without colorVariants */}
              {!hasColorVariants && product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Select Color
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {product.colors.map((color, index) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColorIndex(index)}
                        className={`px-4 py-2 border-2 rounded transition-all text-sm font-medium ${
                          selectedColorIndex === index
                            ? 'border-[#C47456] bg-[#C47456] text-white'
                            : 'border-gray-300 text-gray-700 hover:border-[#C47456]'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <span
                  className={`text-sm font-semibold ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {product.stock > 0 
                    ? `${product.stock} in stock` 
                    : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleAddToCart}
                disabled={isAdding || product.stock === 0}
                className="flex-1 bg-[#2C2C2C] hover:bg-[#C47456] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} className="mr-2" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button
                onClick={handleWishlistClick}
                variant="outline"
                className={`border-2 transition-all ${
                  isWishlisted
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-[#C47456]'
                }`}
              >
                <Heart
                  size={18}
                  className={isWishlisted ? 'fill-red-500 text-red-500' : ''}
                />
              </Button>
            </div>

            {/* View Full Details Link */}
            <Link
              href={`/products/${product.slug}`}
              className="text-center mt-4 text-[#C47456] hover:text-[#2C2C2C] font-semibold transition-colors underline"
            >
              View Full Details →
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}