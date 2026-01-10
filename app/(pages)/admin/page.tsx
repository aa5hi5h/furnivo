'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
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
import AdminSearchBar from '@/components/admin/AdminSearchbar';
import OrderSearchBar from '@/components/admin/OrderSearchBar';
import CustomerSearchBar from '@/components/admin/CustomerSearchBar';
import BookingSearchBar from '@/components/admin/BookingSearchbar';
import AdminProfileDropdown from '@/components/admin/AdminProfileDropdown';

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
  user?: {
    name: string | null;
    email: string;
  };
  orderItems?: any[];
}

interface DesignBooking {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  preferredDate: string | null;
  preferredTime: string | null;
  budgetRange: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  totalOrders: number;
  totalReviews: number;
  totalSpent: number;
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
            setProduct({
              ...product,
              originalPrice: parseFloat(e.target.value) || 0,
            })
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
            images: e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
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
            colors: e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
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
  const [bookings, setBookings] = useState<DesignBooking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [viewOrderDetails, setViewOrderDetails] = useState<Order | null>(null);
  const [viewBookingDetails, setViewBookingDetails] = useState<DesignBooking | null>(null);

  const [newProduct, setNewProduct] = useState(initialProductState);
  const [editProduct, setEditProduct] = useState(initialProductState);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    } else if (status === 'authenticated') {
      loadProducts();
      loadOrders();
      loadBookings();
      loadCustomers();
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

  const loadBookings = async () => {
    try {
      const res = await fetch('/api/admin/design-bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/admin/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
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

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        loadOrders();
        if (viewOrderDetails?.id === orderId) {
          const updated = await res.json();
          setViewOrderDetails(updated);
        }
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order');
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/design-bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        loadBookings();
        if (viewBookingDetails?.id === bookingId) {
          const updated = await res.json();
          setViewBookingDetails(updated);
        }
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error updating booking');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      const res = await fetch(`/api/admin/design-bookings/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadBookings();
        setViewBookingDetails(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking');
    }
  };

  // NEW: Handle admin search actions
  const handleEditProductFromSearch = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      handleEditClick(product);
    }
  };

  const handleDeleteProductFromSearch = (productId: string) => {
    handleDeleteProduct(productId);
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
    { title: 'Active Customers', value: customers.length, icon: Users },
  ];

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, value: 'dashboard' },
    { name: 'Products', icon: Package, value: 'products' },
    { name: 'Orders', icon: ShoppingBag, value: 'orders' },
    { name: 'Customers', icon: Users, value: 'customers' },
    { name: 'Design Bookings', icon: Calendar, value: 'bookings' },
    { name: 'Analytics', icon: BarChart3, value: 'analytics' },
    { name: 'Settings', icon: Settings, value: 'settings' },
  ];

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {/* Smart Tab-Based Search */}
            {activeTab === 'products' && (
              <div className="w-96">
                <AdminSearchBar
                  onEdit={handleEditProductFromSearch}
                  onDelete={handleDeleteProductFromSearch}
                />
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="w-96">
                <OrderSearchBar
                  orders={orders}
                  onSelect={(order) => setViewOrderDetails(order)}
                />
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="w-96">
                <CustomerSearchBar customers={customers} />
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="w-96">
                <BookingSearchBar
                  bookings={bookings}
                  onSelect={(booking) => setViewBookingDetails(booking)}
                />
              </div>
            )}

            {!['products', 'orders', 'customers', 'bookings'].includes(activeTab) && (
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

           
            <AdminProfileDropdown 
  onSettingsClick={() => setActiveTab('settings')}
/>
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Design Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.slice(0, 5).map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.name}</TableCell>
                            <TableCell className="text-xs">{booking.serviceType}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
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
                      {filteredProducts.map((product) => (
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
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>All Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">
                            {order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{order.user?.name || 'N/A'}</div>
                              <div className="text-gray-500 text-xs">{order.user?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="px-2 py-1 rounded text-xs border"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewOrderDetails(order)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Dialog open={!!viewOrderDetails} onOpenChange={() => setViewOrderDetails(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                  </DialogHeader>
                  {viewOrderDetails && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-600">Order ID</Label>
                          <p className="font-mono text-sm">{viewOrderDetails.id}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Date</Label>
                          <p>{new Date(viewOrderDetails.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Customer</Label>
                          <p>{viewOrderDetails.user?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{viewOrderDetails.user?.email}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Total Amount</Label>
                          <p className="text-lg font-bold">₹{viewOrderDetails.totalAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Payment Method</Label>
                          <p>{viewOrderDetails.paymentMethod || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Status</Label>
                          <select
                            value={viewOrderDetails.status}
                            onChange={(e) => handleUpdateOrderStatus(viewOrderDetails.id, e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      {viewOrderDetails.orderItems && viewOrderDetails.orderItems.length > 0 && (
                        <div>
                          <Label className="text-gray-600 mb-2 block">Order Items</Label>
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product</TableHead>
                                  <TableHead>Quantity</TableHead>
                                  <TableHead>Price</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {viewOrderDetails.orderItems.map((item: any) => (
                                  <TableRow key={item.id}>
                                    <TableCell>{item.product?.name || 'N/A'}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>₹{item.price.toLocaleString()}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === 'customers' && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Total Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {customer.image ? (
                                <Image
                                  src={customer.image}
                                  alt={customer.name || ''}
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                              ) : (
                                <Users className="w-5 h-5" />
                              )}
                            </div>
                            <span className="font-medium">{customer.name || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.totalOrders}</TableCell>
                        <TableCell>₹{customer.totalSpent.toLocaleString()}</TableCell>
                        <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeTab === 'bookings' && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Design Service Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Preferred Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{booking.email}</div>
                              <div className="text-gray-500">{booking.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{booking.serviceType}</TableCell>
                          <TableCell>
                            {booking.preferredDate
                              ? new Date(booking.preferredDate).toLocaleDateString()
                              : 'Not specified'}
                          </TableCell>
                          <TableCell>
                            <select
                              value={booking.status}
                              onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                              className="px-2 py-1 rounded text-xs border"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewBookingDetails(booking)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteBooking(booking.id)}
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

              <Dialog open={!!viewBookingDetails} onOpenChange={() => setViewBookingDetails(null)}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Booking Details</DialogTitle>
                  </DialogHeader>
                  {viewBookingDetails && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-600">Name</Label>
                          <p className="font-medium">{viewBookingDetails.name}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Email</Label>
                          <p>{viewBookingDetails.email}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Phone</Label>
                          <p>{viewBookingDetails.phone}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Service Type</Label>
                          <p>{viewBookingDetails.serviceType}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Preferred Date</Label>
                          <p>
                            {viewBookingDetails.preferredDate
                              ? new Date(viewBookingDetails.preferredDate).toLocaleDateString()
                              : 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Preferred Time</Label>
                          <p>{viewBookingDetails.preferredTime || 'Not specified'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Budget Range</Label>
                          <p>{viewBookingDetails.budgetRange || 'Not specified'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Status</Label>
                          <select
                            value={viewBookingDetails.status}
                            onChange={(e) => handleUpdateBookingStatus(viewBookingDetails.id, e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      {viewBookingDetails.message && (
                        <div>
                          <Label className="text-gray-600">Message</Label>
                          <p className="mt-1 p-3 bg-gray-50 rounded-md">{viewBookingDetails.message}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-gray-600">Submitted</Label>
                        <p>{new Date(viewBookingDetails.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === 'analytics' && (
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600">Avg Order Value</div>
                      <div className="text-2xl font-bold">
                        ₹{orders.length > 0
                          ? Math.round(orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length)
                          : 0}
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-gray-600">Total Products</div>
                      <div className="text-2xl font-bold">{products.length}</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-sm text-gray-600">Pending Bookings</div>
                      <div className="text-2xl font-bold">
                        {bookings.filter(b => b.status === 'pending').length}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">More detailed analytics features coming soon.</p>
                </div>
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