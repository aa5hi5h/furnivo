'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, Eye, Heart, ShoppingCart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/cart-context';
import { QuickViewModal } from '@/components/quick-view-modal';
import Link from 'next/link';

interface Collection {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  hero_image_url?: string;
  description: string;
  inspiration_text?: string;
  designer_quote?: string;
  designer_name?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  images: string[];
  colors?: string[];
  rating: number;
  review_count: number;
  stock: number;
}

export default function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const [expandedSections, setExpandedSections] = useState(new Set(['materials', 'care']));
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const { toast } = useToast();
  const { addToCart } = useCart();

  const { slug } = use(params);

  useEffect(() => {
    fetchCollectionAndProducts();
  }, [slug]);

  const fetchCollectionAndProducts = async () => {
    try {
      setLoading(true);
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', slug)
        .single()

      if (collectionError) throw collectionError;
      setCollection(collectionData as Collection);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('collection_id', collectionData.id);

      if (productsError) throw productsError;
      setProducts((productsData || []) as Product[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to load collection' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!collection) {
    return <div className="flex items-center justify-center h-screen">Collection not found</div>;
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleAddToCart = (productId: string, color: string, quantity: number) => {
    addToCart(productId, quantity, color);
    toast({ title: 'Added to cart', description: 'Product added successfully' });
  };

  const handleAddToWishlist = (productId: string) => {
    toast({ title: 'Added to wishlist', description: 'Product saved to wishlist' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="relative w-full h-[80vh] bg-cover bg-center"
        style={{ backgroundImage: `url('${collection.hero_image_url || collection.image_url}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
        <div className="absolute top-4 left-4 text-white text-sm">Home {'\u003E'} Collections {'\u003E'} {collection.name}</div>
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
          <p className="text-white text-sm uppercase tracking-wider mb-4">COLLECTION 2025</p>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4">
            {collection.name}
          </h1>
          <p className="text-white text-xl max-w-xl mb-8">
            {collection.description}
          </p>
          <div className="flex gap-4">
            <Button className="bg-white text-[#2C2C2C] hover:bg-[#C47456] hover:text-white">
              Shop Collection
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/20">
              View Lookbook
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-16 px-4">
          <div>
            <p className="text-sm uppercase tracking-wider text-gray-600 mb-4">THE INSPIRATION</p>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">
              Organic Forms, Timeless Comfort
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>{collection.inspiration_text || 'Discover the story behind this beautiful collection...'}</p>
              <p>Each piece is handcrafted with attention to detail and using sustainable materials.</p>
            </div>
            {collection.designer_quote && (
              <div className="mt-8 p-6 bg-gray-100 border-l-4 border-[#C47456]">
                <p className="text-gray-700 italic mb-2">"{collection.designer_quote}"</p>
                <p className="text-gray-600 text-sm">— {collection.designer_name || 'Designer'}</p>
              </div>
            )}
          </div>
          <div className="bg-gray-200 aspect-video rounded-lg overflow-hidden">
            <img
              src={collection.image_url}
              alt={collection.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-gray-100 py-16 px-4 my-12">
          <h2 className="text-4xl font-serif font-bold text-center text-gray-900 mb-12">
            What Makes It Special
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🌿', title: 'Sustainable Materials', desc: 'FSC-certified hardwoods with zero-VOC finishes' },
              { icon: '✋', title: 'Handcrafted Details', desc: 'Hand-carved elements and traditional joinery' },
              { icon: '🧩', title: 'Modular Design', desc: 'Mix and match pieces for your perfect space' },
              { icon: '🛡️', title: '5-Year Warranty', desc: 'Built to last with comprehensive coverage' },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-lg text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Products Section */}
        <div className="py-16 px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-serif font-bold text-gray-900">Explore the Collection</h2>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {products.map(product => {
              const discount = product.original_price
                ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative overflow-hidden bg-gray-100 aspect-square">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}

                    {discount > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                        -{discount}%
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setQuickViewProduct(product);
                          setShowQuickView(true);
                        }}
                        className="bg-white rounded-full p-3 hover:bg-[#C47456] hover:text-white"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => handleAddToWishlist(product.id)}
                        className="bg-white rounded-full p-3 hover:bg-[#C47456] hover:text-white"
                      >
                        <Heart size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 text-sm mb-2">
                      <Link href={`/products/${product.slug}`} className="hover:text-[#C47456]">
                        {product.name}
                      </Link>
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-gray-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.original_price && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{product.original_price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product.id, '', 1)}
                      disabled={product.stock === 0}
                      className="w-full bg-[#2C2C2C] hover:bg-[#C47456] text-white mt-auto"
                    >
                      <ShoppingCart size={18} className="mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products in this collection yet.</p>
            </div>
          )}
        </div>

        {/* Customization Section */}
        <div className="bg-[#F5F1E8] py-16 px-4 my-12 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Make It Your Own</h2>
              <p className="text-gray-700 mb-6">Customize your pieces to perfectly match your vision:</p>
              <ul className="space-y-3 text-gray-700">
                <li>✓ Wood Finish: 8 premium stains</li>
                <li>✓ Upholstery: 50+ fabric and leather options</li>
                <li>✓ Dimensions: Adjust up to 20% for perfect fit</li>
                <li>✓ Hardware: Select metal finishes</li>
              </ul>
              <Button className="mt-6 bg-[#2C2C2C] hover:bg-[#C47456] text-white">
                Schedule Consultation
              </Button>
            </div>
            <div className="bg-gray-200 rounded-lg aspect-video" />
          </div>
        </div>

        {/* Technical Details */}
        <div className="py-16 px-4">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">Technical Details</h2>
          <div className="space-y-4">
            {['Materials & Craftsmanship', 'Care & Maintenance', 'Warranty & Returns'].map(section => (
              <button
                key={section}
                onClick={() => toggleSection(section)}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <span className="font-semibold text-gray-900">{section}</span>
                <ChevronDown
                  size={20}
                  className={`transition-transform ${
                    expandedSections.has(section) ? 'rotate-180' : ''
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        open={showQuickView}
        onClose={() => setShowQuickView(false)}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleAddToWishlist}
      />
    </div>
  );
}