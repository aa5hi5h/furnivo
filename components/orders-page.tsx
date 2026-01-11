'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  orderItems: OrderItem[];
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (status === 'authenticated') {
      loadOrders();
    } else if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [status, router]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders');
      const result = await response.json();

      if (result.success) {
        setOrders(result.data || []);
      } else if (Array.isArray(result)) {
        setOrders(result);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#C47456]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-[#C47456] hover:bg-[#B36647]' : ''}
            >
              All Orders ({orders.length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              className={filter === 'pending' ? 'bg-[#C47456] hover:bg-[#B36647]' : ''}
            >
              Pending
            </Button>
            <Button
              variant={filter === 'processing' ? 'default' : 'outline'}
              onClick={() => setFilter('processing')}
              className={filter === 'processing' ? 'bg-[#C47456] hover:bg-[#B36647]' : ''}
            >
              Processing
            </Button>
            <Button
              variant={filter === 'shipped' ? 'default' : 'outline'}
              onClick={() => setFilter('shipped')}
              className={filter === 'shipped' ? 'bg-[#C47456] hover:bg-[#B36647]' : ''}
            >
              Shipped
            </Button>
            <Button
              variant={filter === 'delivered' ? 'default' : 'outline'}
              onClick={() => setFilter('delivered')}
              className={filter === 'delivered' ? 'bg-[#C47456] hover:bg-[#B36647]' : ''}
            >
              Delivered
            </Button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't placed any orders yet"
                : `You don't have any ${filter} orders`}
            </p>
            <Link href="/">
              <Button className="bg-[#C47456] hover:bg-[#B36647]">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Order ID</p>
                        <p className="font-mono font-semibold text-gray-900">
                          {order.id.slice(0, 12)}...
                        </p>
                      </div>
                      <Separator orientation="vertical" className="h-10" />
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <Separator orientation="vertical" className="h-10" />
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-semibold text-gray-900">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-medium capitalize">
                          {order.status}
                        </span>
                      </div>
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="ghost" size="sm">
                          View Details
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.orderItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-start gap-4">
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.image ? (
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}

                    {order.orderItems.length > 3 && (
                      <p className="text-sm text-gray-600 text-center py-2">
                        + {order.orderItems.length - 3} more items
                      </p>
                    )}
                  </div>

                  {/* Shipping Address */}
                  {order.address && (
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        Shipping Address
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.address.street}
                        <br />
                        {order.address.city}, {order.address.state}{' '}
                        {order.address.postalCode}
                        <br />
                        {order.address.country}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}