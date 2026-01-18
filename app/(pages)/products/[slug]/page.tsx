'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, Truck, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useCart } from '@/contexts/cart-context';
import { useSession } from 'next-auth/react';
import ReviewSection from '@/components/reviews/ReviewSection';
import RelatedProducts from '@/components/products/RelatedProduct';
import { toast } from 'sonner';

type ColorVariant = {
  color: string;
  colorCode?: string;
  images: string[];
};

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
  colorVariants?: ColorVariant[] | string;
  materials: string | null;
  featured: boolean;
  rating: number | null;
  reviewCount: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  collection?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToCart } = useCart();
  const { data: session } = useSession();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

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

  const THUMBNAILS_PER_VIEW = 4;
  const maxThumbnailIndex = Math.max(0, currentImages.length - THUMBNAILS_PER_VIEW);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  useEffect(() => {
    if (product && session?.user?.id) {
      checkWishlistStatus();
    }
  }, [product, session?.user?.id]);

  const checkWishlistStatus = async () => {
    if (!session?.user?.id || !product) return;

    try {
      const response = await fetch(`/api/wishlist?userId=${session.user.id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const wishlistItem = result.data.find(
            (item: any) => item.productId === product.id
          );
          if (wishlistItem) {
            setIsWishlisted(true);
            setWishlistItemId(wishlistItem.id);
          } else {
            setIsWishlisted(false);
            setWishlistItemId(null);
          }
        }
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!session?.user?.id) {
      toast.error('Authentication required', {
        description: 'Please sign in to add items to your wishlist',
      });
      return;
    }

    if (!product) return;

    setIsTogglingWishlist(true);

    try {
      if (isWishlisted && wishlistItemId) {
        const response = await fetch(`/api/wishlist/${wishlistItemId}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to remove from wishlist');
        }

        setIsWishlisted(false);
        setWishlistItemId(null);
        toast.success('Removed from wishlist', {
          description: 'Product removed from your wishlist',
        });
      } else {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            productId: product.id,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to add to wishlist');
        }

        setIsWishlisted(true);
        setWishlistItemId(result.data.id);
        toast.success('Added to wishlist', {
          description: result.message || 'Product added to your wishlist',
        });
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);
      toast.error('Error', {
        description: error.message || 'Failed to update wishlist',
      });
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${slug}`);
      const result = await response.json();

      if (result.success && result.data) {
        setProduct(result.data);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (index: number) => {
    setSelectedColorIndex(index);
    setSelectedImage(0); // Reset to first image of new color
    setThumbnailStartIndex(0); // Reset thumbnail scroll
  };

  const handlePrevThumbnails = () => {
    setThumbnailStartIndex(Math.max(0, thumbnailStartIndex - 1));
  };

  const handleNextThumbnails = () => {
    setThumbnailStartIndex(Math.min(maxThumbnailIndex, thumbnailStartIndex + 1));
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity, currentColorName);
      toast.success('Added to cart', {
        description: `${product.name} has been added to your cart`,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C47456]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const rating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;

  const visibleThumbnails = currentImages.slice(
    thumbnailStartIndex,
    thumbnailStartIndex + THUMBNAILS_PER_VIEW
  );

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-[#C47456]">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/products" className="hover:text-[#C47456]">
            Products
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            href={`/products?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#C47456]"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#2C2C2C]">{product.name}</span>
        </div>

        {/* Product Details Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
              {currentImages[selectedImage] && (
                <Image
                  src={currentImages[selectedImage]}
                  alt={`${product.name} - ${currentColorName}`}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* Thumbnail Gallery with Navigation */}
            <div className="relative flex items-center gap-2">
              {/* Left Arrow */}
              {currentImages.length > THUMBNAILS_PER_VIEW && (
                <button
                  onClick={handlePrevThumbnails}
                  disabled={thumbnailStartIndex === 0}
                  className="absolute left-0 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Thumbnails */}
              <div className="flex-1 overflow-hidden">
                <div className="grid grid-cols-4 gap-4">
                  {visibleThumbnails.map((image, index) => {
                    const actualIndex = thumbnailStartIndex + index;
                    return (
                      <button
                        key={actualIndex}
                        onClick={() => setSelectedImage(actualIndex)}
                        className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden transition-all ${
                          selectedImage === actualIndex
                            ? 'ring-2 ring-[#C47456]'
                            : 'hover:ring-2 hover:ring-gray-300'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${actualIndex + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Arrow */}
              {currentImages.length > THUMBNAILS_PER_VIEW && (
                <button
                  onClick={handleNextThumbnails}
                  disabled={thumbnailStartIndex >= maxThumbnailIndex}
                  className="absolute right-0 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Thumbnail indicator */}
            {currentImages.length > THUMBNAILS_PER_VIEW && (
              <div className="flex justify-center gap-1 mt-3">
                {Array.from({ length: Math.ceil(currentImages.length / THUMBNAILS_PER_VIEW) }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all ${
                        Math.floor(thumbnailStartIndex / THUMBNAILS_PER_VIEW) === i
                          ? 'w-6 bg-[#C47456]'
                          : 'w-2 bg-gray-300'
                      }`}
                    />
                  )
                )}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="font-serif text-4xl font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{rating.toFixed(1)}</span>
                <span className="text-sm text-gray-600">({reviewCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              {product.originalPrice && (
                <span className="text-2xl text-gray-400 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-4xl font-bold">₹{product.price.toLocaleString()}</span>
              {discount > 0 && (
                <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

            {/* Color Selection */}
            {hasColorVariants && (
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">
                  Color {currentColorName && `- ${currentColorName}`}
                </label>
                <div className="flex flex-wrap gap-3">
                  {colorVariants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorChange(index)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedColorIndex === index
                          ? 'border-[#C47456] bg-[#C47456]/10'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {variant.colorCode && (
                        <div
                          className="w-5 h-5 rounded-full border-2 border-gray-300"
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

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-[#C47456]"
                >
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-[#C47456]"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              {product.stock < 10 && product.stock > 0 && (
                <p className="text-sm text-orange-600 mt-2">
                  Only {product.stock} items left in stock
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <Button
                size="lg"
                className="flex-1 bg-[#2C2C2C] hover:bg-[#2C2C2C]/90 text-lg py-6"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="py-6"
                onClick={toggleWishlist}
                disabled={isTogglingWishlist}
              >
                {isTogglingWishlist ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart
                    className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
                  />
                )}
              </Button>
            </div>

            {/* Shipping Info */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-5 h-5 text-[#C47456]" />
                <span>Free delivery in 2-4 weeks</span>
              </div>
            </div>

            {/* Design Consultation Link */}
            <Link
              href="/design-services"
              className="text-[#C47456] hover:underline font-medium"
            >
              Book Design Consultation →
            </Link>

            {/* Product Details Accordion */}
            <Accordion type="single" collapsible className="mt-8">
              <AccordionItem value="details">
                <AccordionTrigger>Product Details</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Materials:</strong> {product.materials || 'Premium quality materials'}
                    </p>
                    <p>
                      <strong>Category:</strong> {product.category}
                    </p>
                    <p>
                      <strong>Stock:</strong> {product.stock} available
                    </p>
                    {product.collection && (
                      <p>
                        <strong>Collection:</strong> {product.collection.name}
                      </p>
                    )}
                    {hasColorVariants && (
                      <p>
                        <strong>Available Colors:</strong> {colorVariants.length}
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="dimensions">
                <AccordionTrigger>Dimensions</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-gray-600">
                    Detailed dimensions available upon request or during design consultation.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger>Materials & Care</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-gray-600">
                    {product.materials || 'Premium quality materials'}. Clean with a soft, damp
                    cloth. Avoid harsh chemicals.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Shipping Info</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-gray-600">
                    Free standard shipping (2-4 weeks). Express shipping available at checkout.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection productId={product.id} userId={session?.user?.id} />

        {/* Related Products */}
        <RelatedProducts productId={product.id} />
      </div>
    </div>
  );
}