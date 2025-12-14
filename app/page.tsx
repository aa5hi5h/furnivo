import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Facebook, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/product-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .limit(4);

  return data || [];
}

async function getWavveProducts() {
  const { data: collection } = await supabase
    .from('collections')
    .select('id')
    .eq('slug', 'wavve-collection')
    .single();

  if (!collection) return [];

  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('collection_id', collection.id)
    .limit(4);

  return data || [];
}

async function getWavveCollection() {
  const { data } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', 'wavve-collection')
    .single();

  return data;
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const wavveProducts = await getWavveProducts();
  const wavveCollection = await getWavveCollection();

  return (
    <div className="bg-[#F5F1E8]">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-end pb-16">
          <div className="text-white max-w-xl">
            <h1 className="font-serif text-5xl lg:text-6xl font-bold mb-4">
              Crafted for Comfort. Designed for Life.
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Discover furniture that transforms your space
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-white text-[#2C2C2C] hover:bg-white/90 text-lg px-8">
                Explore Collections
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-wider text-[#C47456] mb-2">BESTSELLERS</p>
            <h2 className="font-serif text-4xl font-bold text-[#2C2C2C] mb-8">Pieces You'll Love</h2>
          </div>

          <Tabs defaultValue="bestsellers" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
              <TabsTrigger value="bestsellers">Best Sellers</TabsTrigger>
              <TabsTrigger value="ready">Ready to Ship</TabsTrigger>
              <TabsTrigger value="new">New Arrivals</TabsTrigger>
            </TabsList>
            <TabsContent value="bestsellers">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product:any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="ready">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product:any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="new">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product:any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {wavveCollection && (
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-[500px] rounded-2xl overflow-hidden">
                <Image
                  src={wavveCollection.image_url}
                  alt={wavveCollection.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-[#C47456] mb-4">
                  {wavveCollection.name.toUpperCase()}
                </p>
                <h2 className="font-serif text-4xl font-bold text-[#2C2C2C] mb-6">
                  Sculptural Design Meets Functional Beauty
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {wavveCollection.description}
                </p>
                <Link href={`/collections/${wavveCollection.slug}`}>
                  <Button className="bg-[#2C2C2C] hover:bg-[#2C2C2C]/90">
                    Explore Collection
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {wavveProducts.slice(0, 4).map((product:any) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group"
                    >
                      <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden mb-2">
                        {product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        )}
                      </div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">₹{product.price.toLocaleString()}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-4xl font-bold text-[#2C2C2C] mb-12 text-center">
            More from the Wavve Collection
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wavveProducts.map((product:any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="relative h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg"
                alt="Store Interior"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="font-serif text-4xl font-bold text-[#2C2C2C] mb-8">Our Stores</h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Mumbai</h3>
                  <p className="text-gray-600 mb-2">Delta House, Worli, 400018</p>
                  <Link href="#" className="text-[#C47456] underline hover:no-underline mb-2 inline-block">
                    GET DIRECTIONS
                  </Link>
                  <p className="text-sm text-gray-600">Every day 10am to 7pm</p>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-2">Goa</h3>
                  <p className="text-gray-600 mb-2">FC Goa House, Porvorim, 403521</p>
                  <Link href="#" className="text-[#C47456] underline hover:no-underline mb-2 inline-block">
                    GET DIRECTIONS
                  </Link>
                  <p className="text-sm text-gray-600">Every day 10am to 7pm</p>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
                  <div className="flex gap-4">
                    <Link href="#" className="hover:text-[#C47456] transition-colors">
                      <Facebook className="w-6 h-6" />
                    </Link>
                    <Link href="#" className="hover:text-[#C47456] transition-colors">
                      <Instagram className="w-6 h-6" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
