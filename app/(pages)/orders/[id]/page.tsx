'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  CreditCard,
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
  Download,
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
    slug: string;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  user?: {
    name: string;
    email: string;
  };
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = params.id as string;

  useEffect(() => {
    if (status === 'authenticated' && orderId) {
      loadOrder();
    } else if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [status, orderId, router]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const result = await response.json();

      if (result.success) {
        setOrder(result.data);
      } else {
        console.error('Failed to load order:', result.error);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'processing':
        return <Package className="w-6 h-6 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { label: 'Order Placed', value: 'pending', icon: CheckCircle },
      { label: 'Processing', value: 'processing', icon: Package },
      { label: 'Shipped', value: 'shipped', icon: Truck },
      { label: 'Delivered', value: 'delivered', icon: CheckCircle },
    ];

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status.toLowerCase());

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  const calculateSubtotal = () => {
    if (!order) return 0;
    return order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18;
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 50000 ? 0 : 500;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#C47456]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">This order doesn't exist or you don't have access to it</p>
          <Link href="/orders">
            <Button className="bg-[#C47456] hover:bg-[#B36647]">
              View All Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/orders" className="inline-flex items-center text-gray-600 hover:text-[#C47456] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order Details
              </h1>
              <p className="text-gray-600">
                Order ID: <span className="font-mono font-semibold">{order.id}</span>
              </p>
            </div>
            <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border-2 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="text-lg font-semibold capitalize">{order.status}</span>
            </div>
          </div>

          {/* Order Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Order Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Payment Method</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {order.paymentMethod?.replace('phonepe:', '')}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-lg font-bold text-[#C47456]">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            {order.status.toLowerCase() !== 'cancelled' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div
                    className="absolute left-6 top-0 w-0.5 bg-[#C47456] transition-all duration-500"
                    style={{
                      height: `${(statusSteps.filter(s => s.completed).length - 1) * 33.33}%`,
                    }}
                  />

                  {/* Steps */}
                  <div className="space-y-8">
                    {statusSteps.map((step, index) => (
                      <div key={step.value} className="relative flex items-start gap-4">
                        <div
                          className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                            step.completed
                              ? 'bg-[#C47456] border-[#C47456] text-white'
                              : 'bg-white border-gray-300 text-gray-400'
                          }`}
                        >
                          <step.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 pt-2">
                          <h3
                            className={`font-semibold ${
                              step.completed ? 'text-gray-900' : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </h3>
                          {step.active && (
                            <p className="text-sm text-gray-600 mt-1">
                              Your order is currently being {step.label.toLowerCase()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-semibold text-gray-900 hover:text-[#C47456] transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Price: ₹{item.price.toLocaleString('en-IN')} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shipping Address */}
            {order.address && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h3>
                <div className="text-gray-700 space-y-1">
                  <p>{order.address.street}</p>
                  <p>
                    {order.address.city}, {order.address.state}
                  </p>
                  <p>{order.address.postalCode}</p>
                  <p>{order.address.country}</p>
                </div>
              </div>
            )}

            {/* Customer Info */}
            {order.user && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Info</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-gray-900">{order.user.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>
                    {calculateShipping() === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      `₹${calculateShipping().toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (GST 18%)</span>
                  <span>₹{calculateTax().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-[#C47456]">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-800 mb-4">
                If you have any questions about your order, please contact our support team.
              </p>
              <Link href="/contact">
                <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-100">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}