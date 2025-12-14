import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';

async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="font-serif text-5xl font-bold text-[#2C2C2C] mb-4">All Products</h1>
          <p className="text-gray-600 text-lg">Discover our complete collection of premium furniture</p>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Category</h3>
                <div className="space-y-2">
                  {['Living Room', 'Bedroom', 'Dining', 'Office', 'Outdoor'].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold mb-4">Price Range</h3>
                <div className="space-y-2">
                  {[
                    'Under ₹20,000',
                    '₹20,000 - ₹50,000',
                    '₹50,000 - ₹100,000',
                    'Above ₹100,000',
                  ].map((range) => (
                    <label key={range} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{range}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold mb-4">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {['beige', 'grey', 'brown', 'black', 'white', 'teal'].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-[#C47456]"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <p className="text-gray-600">{products.length} products</p>
              <select className="border border-gray-300 rounded-lg px-4 py-2">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
                <option>Best Selling</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product:any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-600 mb-4">No products found</p>
                <Button>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
