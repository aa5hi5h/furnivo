import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Facebook, Instagram, Truck, Shield, Award, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CtaDirection from '@/components/cta-dir';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

async function getProductsBySort(sortBy: string) {
  try {
    const res = await fetch(`${API_BASE}/api/products?limit=50`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    let products = data.data || [];
    
    if (sortBy === 'bestseller') {
      products.sort((a: any, b: any) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (sortBy === 'new') {
      products.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return products.slice(0, 8);
  } catch (error) {
    console.error(`Error fetching ${sortBy} products:`, error);
    return [];
  }
}

async function getWavveCollection() {
  try {
    const res = await fetch(`${API_BASE}/api/collections/wavve-collection`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching wavve collection:', error);
    return null;
  }
}

async function getAllCollections() {
  try {
    const res = await fetch(`${API_BASE}/api/collections?limit=6`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

async function getAllProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/products?limit=50`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

export default async function Home() {
  const [
    bestSellerProducts,
    newArrivalProducts,
    allProducts,
    wavveCollection,
    collections
  ] = await Promise.all([
    getProductsBySort('bestseller'),
    getProductsBySort('new'),
    getAllProducts(),
    getWavveCollection(),
    getAllCollections()
  ]);

  const readyToShipProducts = allProducts.filter((p: any) => p.stock > 0).slice(0, 8);
  const wavveProducts = allProducts.filter((p: any) => p.collectionId === wavveCollection?.id).slice(0, 4);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[600px] bg-[#F5F1E8]">
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg"
            alt="Comfort Cloud Sofa"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-end pb-16">
          <div className="text-white max-w-xl">
            <p className="text-lg mb-2 font-light tracking-wide">WELCOME TO FurnZ</p>
            <h1 className="font-serif text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Crafted for Comfort. Designed for Life.
            </h1>
            <p className="text-xl mb-8 text-gray-100 font-light">
              Discover furniture that transforms your space into a sanctuary of style and comfort
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-[#C47456] hover:bg-[#C47456]/90 text-white text-lg px-8 rounded-lg">
                Explore Collections
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="bg-[#2C2C2C] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <Truck className="w-8 h-8 text-[#C47456]" />
              <div>
                <h3 className="font-semibold">Free Shipping</h3>
                <p className="text-sm text-gray-300">On orders above ₹50,000</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-[#C47456]" />
              <div>
                <h3 className="font-semibold">Secure Payment</h3>
                <p className="text-sm text-gray-300">100% safe transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Award className="w-8 h-8 text-[#C47456]" />
              <div>
                <h3 className="font-semibold">Quality Assured</h3>
                <p className="text-sm text-gray-300">Premium furniture pieces</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured/Best Sellers Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-[#C47456] mb-2 font-semibold">OUR COLLECTION</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#2C2C2C] mb-4">
              Discover What You Love
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Handpicked furnitue pieces that combine style, comfort, and quality
            </p>
          </div>

          <Tabs defaultValue="bestsellers" className="w-full">
  <div className="flex justify-center mb-12">
    <TabsList className="inline-flex gap-2 p-2 bg-gray-100 rounded-lg">
      <TabsTrigger 
        value="bestsellers"
        className="px-3 sm:px-6 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#C47456] data-[state=active]:shadow-md transition-all"
      >
        <TrendingUp className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Best Sellers</span>
      </TabsTrigger>
      <TabsTrigger 
        value="ready"
        className="px-3 sm:px-6 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#C47456] data-[state=active]:shadow-md transition-all"
      >
        <Truck className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Ready to Ship</span>
      </TabsTrigger>
      <TabsTrigger 
        value="new"
        className="px-3 sm:px-6 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#C47456] data-[state=active]:shadow-md transition-all"
      >
        <Sparkles className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">New Arrivals</span>
      </TabsTrigger>
    </TabsList>
  </div>

            <TabsContent value="bestsellers" className="animate-in fade-in">
              {bestSellerProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {bestSellerProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">No bestseller products available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ready" className="animate-in fade-in">
              {readyToShipProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {readyToShipProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">No products ready to ship</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="new" className="animate-in fade-in">
              {newArrivalProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {newArrivalProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">No new arrival products available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="text-center mt-12">
            <Link href="/products">
              <Button variant="outline" size="lg" className="border-[#C47456] text-[#C47456] hover:bg-[#C47456] hover:text-white">
                View All Products
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Wavve Collection Section */}
      {wavveCollection && (
        <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl order-2 lg:order-1">
                <Image
                  src={wavveCollection.imageUrl || "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg"}
                  alt={wavveCollection.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="order-1 lg:order-2">
                <p className="text-sm uppercase tracking-widest text-[#C47456] mb-4 font-semibold">
                  FEATURED COLLECTION
                </p>
                <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#2C2C2C] mb-6 leading-tight">
                  {wavveCollection.name}
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                  {wavveCollection.description || "Sculptural Design Meets Functional Beauty. Discover our curated collection of premium furniture pieces designed for modern living."}
                </p>
                
                <Link href={`/collections/${wavveCollection.slug}`}>
                  <Button className="bg-[#2C2C2C] hover:bg-[#2C2C2C]/90 text-white mb-12">
                    Explore Full Collection
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">Featured Items</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {wavveProducts.map((product: any) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="group"
                      >
                        <div className="relative aspect-square bg-gray-300 rounded-lg overflow-hidden mb-3 shadow-md">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400">No image</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900 group-hover:text-[#C47456] transition-colors line-clamp-2">
                          {product.name}
                        </p>
                        <p className="text-sm font-semibold text-[#C47456]">
                          ₹{product.price?.toLocaleString('en-IN')}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-[#2C2C2C] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Space?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Explore our complete collection and find the perfect furniture for your home
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-[#C47456] hover:bg-[#C47456]/90 text-white">
              Start Shopping
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

       {/* Collections Section */}
       {collections && collections.length > 0 && (
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-widest text-[#C47456] mb-2 font-semibold">BROWSE BY</p>
              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#2C2C2C] mb-4">
                Our Collections
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Explore curated collections designed for every style and space
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.map((collection: any) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  className="group"
                >
                  <div className="relative h-80 bg-gray-300 rounded-xl overflow-hidden shadow-lg mb-4">
                    {collection.imageUrl ? (
                      <Image
                        src={collection.imageUrl}
                        alt={collection.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-500 text-lg">No image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#2C2C2C] group-hover:text-[#C47456] transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-gray-600 mt-2 line-clamp-2">
                    {collection.description || "Explore this collection"}
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-[#C47456] font-medium">
                    View Collection
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

<section className="bg-gradient-to-r from-[#2C2C2C] to-[#3a3a3a] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4 p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <Truck className="w-10 h-10 text-[#C47456] flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Free Shipping</h3>
                <p className="text-sm text-gray-300">On orders above ₹50,000</p>
                <p className="text-xs text-gray-400 mt-2">Pan India delivery in 7-14 days</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <Shield className="w-10 h-10 text-[#C47456] flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Secure Payment</h3>
                <p className="text-sm text-gray-300">100% safe transactions</p>
                <p className="text-xs text-gray-400 mt-2">SSL encrypted with Razorpay</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <Award className="w-10 h-10 text-[#C47456] flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Quality Assured</h3>
                <p className="text-sm text-gray-300">Premium furniture pieces</p>
                <p className="text-xs text-gray-400 mt-2">Crafted with finest materials</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 text-[#C47456] flex-shrink-0 flex items-center justify-center text-xl font-bold">✓</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Easy Returns</h3>
                <p className="text-sm text-gray-300">30-day hassle-free returns</p>
                <p className="text-xs text-gray-400 mt-2">Full refund or exchange</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-[#C47456]">500+</p>
                <p className="text-gray-300 mt-1">Premium Products</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#C47456]">10K+</p>
                <p className="text-gray-300 mt-1">Happy Customers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#C47456]">4.8★</p>
                <p className="text-gray-300 mt-1">Customer Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* Stores Section */}
      <CtaDirection />
    </div>
  );
}