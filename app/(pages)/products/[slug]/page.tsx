'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, Truck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import ReviewSection from '@/components/reviews/ReviewSection';
import RelatedProducts from '@/components/products/RelatedProduct';

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
  const { toast } = useToast();
  const { data: session } = useSession();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

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
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add items to your wishlist',
        variant: 'error',
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
        toast({
          title: 'Removed from wishlist',
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
        toast({
          title: 'Added to wishlist',
          description: result.message || 'Product added to your wishlist',
        });
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update wishlist',
        variant: 'error',
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
        if (result.data.colors && result.data.colors.length > 0) {
          setSelectedColor(result.data.colors[0]);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity, selectedColor);
      toast({
        title: 'Added to cart',
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

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-[#C47456]">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/products" className="hover:text-[#C47456]">Products</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#C47456]">
            {product.category}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#2C2C2C]">{product.name}</span>
        </div>

        {/* Product Details Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
              {product.images[selectedImage] && (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-[#C47456]' : ''
                  }`}
                >
                  <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
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
                        i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
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
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">
                  Color {selectedColor && `- ${selectedColor}`}
                </label>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all capitalize ${
                        selectedColor === color
                          ? 'border-[#C47456] bg-[#C47456]/10'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {color}
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
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
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
            <Link href="/design-services" className="text-[#C47456] hover:underline font-medium">
              Book Design Consultation →
            </Link>

            {/* Product Details Accordion */}
            <Accordion type="single" collapsible className="mt-8">
              <AccordionItem value="details">
                <AccordionTrigger>Product Details</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Materials:</strong> {product.materials || 'Premium quality materials'}</p>
                    <p><strong>Category:</strong> {product.category}</p>
                    <p><strong>Stock:</strong> {product.stock} available</p>
                    {product.collection && (
                      <p><strong>Collection:</strong> {product.collection.name}</p>
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
                    {product.materials || 'Premium quality materials'}. Clean with a soft, damp cloth. Avoid harsh chemicals.
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
        <ReviewSection 
          productId={product.id} 
          userId={session?.user?.id}
        />

        {/* Related Products */}
        <RelatedProducts productId={product.id} />
      </div>
    </div>
  );
}