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
import { supabase, type Product } from '@/lib/supabase';
import { useCart } from '@/contexts/cart-context';
import ProductCard from '@/components/product-card';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (data) {
      setProduct(data);
      if (data.colors && data.colors.length > 0) {
        setSelectedColor(data.colors[0]);
      }
      loadSimilarProducts(data.category);
    }
    setLoading(false);
  };

  const loadSimilarProducts = async (category: string) => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .neq('slug', slug)
      .limit(4);

    if (data) {
      setSimilarProducts(data);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity, selectedColor);
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

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-[#C47456]">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/category/${product.category.toLowerCase().replace(' ', '-')}`} className="hover:text-[#C47456]">
            {product.category}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#2C2C2C]">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
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
              {product.images.map((image:any, index:any) => (
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

          <div>
            <h1 className="font-serif text-4xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">({product.review_count} reviews)</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              {product.original_price && (
                <span className="text-2xl text-gray-400 line-through">
                  ₹{product.original_price.toLocaleString()}
                </span>
              )}
              <span className="text-4xl font-bold">₹{product.price.toLocaleString()}</span>
              {discount > 0 && (
                <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">Color</label>
                <div className="flex gap-3">
                  {product.colors.map((color:any) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
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
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-[#C47456]"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <Button
                size="lg"
                className="flex-1 bg-[#2C2C2C] hover:bg-[#2C2C2C]/90 text-lg py-6"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="py-6">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-5 h-5 text-[#C47456]" />
                <span>Free delivery in 2-4 weeks</span>
              </div>
            </div>

            <Link href="/design-services" className="text-[#C47456] hover:underline font-medium">
              Book Design Consultation →
            </Link>

            <Accordion type="single" collapsible className="mt-8">
              <AccordionItem value="details">
                <AccordionTrigger>Product Details</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Materials:</strong> {product.materials || 'Premium quality materials'}</p>
                    <p><strong>Category:</strong> {product.category}</p>
                    <p><strong>Stock:</strong> {product.stock} available</p>
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

        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.review_count})</TabsTrigger>
            <TabsTrigger value="similar">Similar</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="py-8">
            <div className="max-w-3xl mx-auto prose prose-lg">
              <p>{product.description}</p>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="py-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
            </div>
          </TabsContent>
          <TabsContent value="similar" className="py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {similarProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
