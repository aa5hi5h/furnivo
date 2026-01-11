// app/order-success/payment-success-content.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/order/${orderId}`);
        const data = await response.json();

        if (data.success && data.data) {
          setOrder(data.data);
        } else {
          setError('Could not load order details');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C47456]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-400 to-red-500 px-6 py-12 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Unable to Load Order
              </h1>
              <p className="text-red-50">{error || 'Order not found'}</p>
            </div>
            <div className="px-6 py-8">
              <p className="text-gray-600 mb-6">
                We couldn't retrieve your order details. Please check your order ID or contact support.
              </p>
              <Button asChild className="bg-[#C47456] hover:bg-[#B36647]">
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-400 to-green-500 px-6 py-12 text-center">
            <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">
              Payment Successful!
            </h1>
            <p className="text-green-50">
              Your order has been confirmed and will be processed soon.
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {/* Order Details */}
            {order && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    📧 A confirmation email has been sent to{' '}
                    <span className="font-semibold">
                      {order.user?.email || 'your email'}
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Order ID
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-1 break-all">
                      {order.id}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Total Amount
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      ₹
                      {(order.totalAmount / 100).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Summary
                  </h2>

                  {order.orderItems && order.orderItems.length > 0 ? (
                    <div className="space-y-3">
                      {order.orderItems.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-start pb-3 border-b last:border-0"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {item.product?.name || 'Product'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity}
                            </p>
                            {item.color && (
                              <p className="text-sm text-gray-600">
                                Color: {item.color}
                              </p>
                            )}
                          </div>
                          <p className="font-medium text-gray-900 whitespace-nowrap ml-4">
                            ₹
                            {(item.price * item.quantity).toLocaleString(
                              'en-IN'
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No items in order</p>
                  )}
                </div>

                {/* Shipping Address */}
                {order.address && (
                  <div className="border-t pt-6 mt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Shipping Address
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 font-medium">
                        {order.address.street}
                      </p>
                      <p className="text-gray-600">
                        {order.address.city}, {order.address.state}{' '}
                        {order.address.postalCode}
                      </p>
                      <p className="text-gray-600">{order.address.country}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Status Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-6">
              <p className="text-sm text-amber-900">
                <span className="font-semibold">📦 What's next?</span>
                <br />
                Your order is being prepared for shipment. You'll receive
                tracking updates via email and SMS.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                asChild
                variant="outline"
                className="border-[#C47456] text-[#C47456] hover:bg-orange-50"
              >
                <Link href="/orders">View My Orders</Link>
              </Button>
              <Button
                asChild
                className="bg-[#C47456] hover:bg-[#B36647]"
              >
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}