'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FolderOpen,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  images: string[];
  colors: string[];
  materials: string | null;
  featured: boolean;
  createdAt: string;
}

interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  paymentMethod: string | null;
  createdAt: string;
}

const initialProductState = {
  name: '',
  slug: '',
  description: '',
  category: 'Living Room',
  price: 0,
  originalPrice: 0,
  stock: 0,
  images: [] as string[],
  colors: [] as string[],
  materials: '',
  featured: false,
};


const ProductForm = ({
  product,
  setProduct,
  onSubmit,
  submitLabel,
}: {
  product: typeof initialProductState;
  setProduct: React.Dispatch<React.SetStateAction<typeof initialProductState>>;
  onSubmit: () => void;
  submitLabel: string;
}) => (
  <div className="space-y-4">
    <div>
      <Label>Product Name</Label>
      <Input
        value={product.name}
        onChange={(e) => setProduct({ ...product, name: e.target.value })}
      />
    </div>
    <div>
      <Label>Slug</Label>
      <Input
        value={product.slug}
        onChange={(e) => setProduct({ ...product, slug: e.target.value })}
        placeholder="product-name-slug"
      />
    </div>
    <div>
      <Label>Description</Label>
      <Textarea
        value={product.description}
        onChange={(e) => setProduct({ ...product, description: e.target.value })}
        rows={3}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Category</Label>
        <select
          className="w-full border rounded-md px-3 py-2"
          value={product.category}
          onChange={(e) => setProduct({ ...product, category: e.target.value })}
        >
          <option>Living Room</option>
          <option>Bedroom</option>
          <option>Dining</option>
          <option>Office</option>
          <option>Outdoor</option>
        </select>
      </div>
      <div>
        <Label>Materials</Label>
        <Input
          value={product.materials}
          onChange={(e) => setProduct({ ...product, materials: e.target.value })}
        />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label>Price</Label>
        <Input
          type="number"
          value={product.price}
          onChange={(e) =>
            setProduct({ ...product, price: parseFloat(e.target.value) || 0 })
          }
        />
      </div>
      <div>
        <Label>Original Price</Label>
        <Input
          type="number"
          value={product.originalPrice}
          onChange={(e) =>
            setProduct({ ...product, originalPrice: parseFloat(e.target.value) || 0 })
          }
        />
      </div>
      <div>
        <Label>Stock</Label>
        <Input
          type="number"
          value={product.stock}
          onChange={(e) =>
            setProduct({ ...product, stock: parseInt(e.target.value) || 0 })
          }
        />
      </div>
    </div>
    <div>
      <Label>Image URLs (comma-separated)</Label>
      <Input
        placeholder="https://example.com/image.jpg, https://example.com/image2.jpg"
        value={product.images.join(', ')}
        onChange={(e) =>
          setProduct({
            ...product,
            images: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
          })
        }
      />
    </div>
    <div>
      <Label>Colors (comma-separated)</Label>
      <Input
        placeholder="beige, grey, brown"
        value={product.colors.join(', ')}
        onChange={(e) =>
          setProduct({
            ...product,
            colors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
          })
        }
      />
    </div>
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="featured"
        checked={product.featured}
        onChange={(e) => setProduct({ ...product, featured: e.target.checked })}
      />
      <Label htmlFor="featured">Featured Product</Label>
    </div>
    <Button onClick={onSubmit} className="w-full bg-[#2C2C2C]">
      {submitLabel}
    </Button>
  </div>
);

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState(initialProductState);
  const [editProduct, setEditProduct] = useState(initialProductState);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    } else if (status === 'authenticated') {
      loadProducts();
      loadOrders();
    }
  }, [status]);

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleAddProduct = async () => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        setIsAddProductOpen(false);
        loadProducts();
        setNewProduct(initialProductState);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    setEditProduct({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      stock: product.stock,
      images: product.images,
      colors: product.colors,
      materials: product.materials || '',
      featured: product.featured,
    });
    setIsEditProductOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProductId) return;

    try {
      const res = await fetch(`/api/admin/products/${editingProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProduct),
      });

      if (res.ok) {
        setIsEditProductOpen(false);
        setEditingProductId(null);
        loadProducts();
        setEditProduct(initialProductState);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadProducts();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C47456]"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}`,
      icon: BarChart3,
    },
    { title: 'Total Orders', value: orders.length, icon: ShoppingBag },
    { title: 'Products Listed', value: products.length, icon: Package },
    { title: 'Active Customers', value: '0', icon: Users },
  ];

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, value: 'dashboard' },
    { name: 'Products', icon: Package, value: 'products' },
    { name: 'Orders', icon: ShoppingBag, value: 'orders' },
    { name: 'Customers', icon: Users, value: 'customers' },
    { name: 'Collections', icon: FolderOpen, value: 'collections' },
    { name: 'Analytics', icon: BarChart3, value: 'analytics' },
    { name: 'Settings', icon: Settings, value: 'settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-[#2C2C2C] text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold font-serif">FURNIVO</h1>
          <p className="text-sm text-gray-400">Admin Panel</p>
        </div>
        <nav className="flex-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                onClick={() => setActiveTab(item.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  activeTab === item.value ? 'bg-[#C47456]' : 'hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-2xl font-bold capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.title}>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </CardTitle>
                        <Icon className="w-4 h-4 text-gray-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{stat.value}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">
                            {order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Products Management</h3>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#2C2C2C]">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <ProductForm
                      product={newProduct}
                      setProduct={setNewProduct}
                      onSubmit={handleAddProduct}
                      submitLabel="Add Product"
                    />
                  </DialogContent>
                </Dialog>

                {/* Edit Product Dialog */}
                <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Product</DialogTitle>
                    </DialogHeader>
                    <ProductForm
                      product={editProduct}
                      setProduct={setEditProduct}
                      onSubmit={handleUpdateProduct}
                      submitLabel="Update Product"
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                              {product.images[0] && (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>₹{product.price.toLocaleString()}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditClick(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'orders' && (
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>{order.paymentMethod || 'N/A'}</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeTab === 'customers' && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Customer management features coming soon.</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'collections' && (
            <Card>
              <CardHeader>
                <CardTitle>Collections Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Collections management features coming soon.</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'analytics' && (
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics features coming soon.</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Settings features coming soon.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}