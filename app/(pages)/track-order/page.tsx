'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, AlertCircle, Truck, Phone, Mail, MessageCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Checkbox } from '@/components/ui/checkbox';

const statusColors = {
  completed: 'bg-green-100 text-green-700',
  current: 'bg-blue-100 text-blue-700',
  pending: 'bg-gray-100 text-gray-700',
};

const mockTrackingData = {
  orderNumber: '#FRN123456',
  orderDate: 'December 10, 2025',
  expectedDelivery: 'December 20, 2025',
  product: 'Wavve 3-Seater Sofa (Beige)',
  quantity: 1,
  total: '₹67,499',
  status: 'In Transit',
  lastUpdated: '2 hours ago',
  currentLocation: 'Mumbai Distribution Center',
  timeline: [
    {
      step: 'Order Placed',
      date: 'Dec 10, 2025 - 2:30 PM',
      icon: '🛒',
      details: 'Order successfully placed and payment confirmed',
      status: 'completed',
    },
    {
      step: 'Order Confirmed',
      date: 'Dec 10, 2025 - 3:45 PM',
      icon: '✓',
      details: 'Order confirmed by our team. Processing begun.',
      status: 'completed',
    },
    {
      step: 'Quality Check',
      date: 'Dec 11, 2025 - 10:00 AM',
      icon: '✓',
      details: 'Product quality verified and approved for shipment',
      status: 'completed',
    },
    {
      step: 'Packaged',
      date: 'Dec 11, 2025 - 4:30 PM',
      icon: '✓',
      details: 'Securely packaged with protective materials',
      status: 'completed',
    },
    {
      step: 'Dispatched',
      date: 'Dec 12, 2025 - 9:15 AM',
      icon: '🚚',
      details: 'Shipped from our warehouse in Bangalore',
      status: 'completed',
    },
    {
      step: 'In Transit',
      date: 'Dec 14, 2025 - 11:00 AM',
      icon: '🚛',
      details: 'Package arrived at Mumbai Distribution Center',
      status: 'current',
    },
    {
      step: 'Out for Delivery',
      date: 'Estimated Dec 20, 2025',
      icon: '📍',
      details: 'Delivery agent will contact you 24 hours before',
      status: 'pending',
    },
    {
      step: 'Delivered',
      date: 'Estimated Dec 20, 2025',
      icon: '✅',
      details: 'Product delivered and signed for',
      status: 'pending',
    },
  ],
};

export default function TrackOrderPage() {
  const [searchType, setSearchType] = useState<'order' | 'tracking'>('order');
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [trackingData, setTrackingData] = useState<typeof mockTrackingData | null>(null);

  const handleSearch = () => {
    if (searchType === 'order' && orderId && email) {
      setTrackingData(mockTrackingData);
      setIsSearched(true);
    } else if (searchType === 'tracking' && trackingId) {
      setTrackingData(mockTrackingData);
      setIsSearched(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-100 to-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
                   <Link href="/" className="hover:text-[#C47456]">Home</Link>
                   <ChevronRight className="w-4 h-4" />
                   <Link href="/track-order" className="hover:text-[#C47456]">
                     Track Order
                   </Link>
                 </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">Track Your Order</h1>
          <p className="text-lg text-gray-600">
            Enter your order details below to see real-time tracking
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isSearched ? (
          <>
            {/* Tracking Input Section */}
            <Card className="p-8 mb-12">
              <Tabs defaultValue="order" onValueChange={(v) => setSearchType(v as 'order' | 'tracking')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="order">By Order Number</TabsTrigger>
                  <TabsTrigger value="tracking">By Tracking ID</TabsTrigger>
                </TabsList>

                <TabsContent value="order" className="space-y-6 mt-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Order Number</label>
                    <Input
                      placeholder="#FRN123456"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email Address or Phone Number</label>
                    <Input
                      placeholder="email@example.com or +91-XXXXXXXXXX"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button className="w-full py-6 text-lg" onClick={handleSearch}>
                    Track Order
                  </Button>
                </TabsContent>

                <TabsContent value="tracking" className="space-y-6 mt-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Courier Tracking ID</label>
                    <Input
                      placeholder="BD1234567890"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                    />
                  </div>
                  <Button className="w-full py-6 text-lg" onClick={handleSearch}>
                    Track Shipment
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="mt-6 pt-6 border-t space-y-2 text-sm text-gray-600">
                <p>Find your order number in confirmation email or SMS</p>
                <p>
                  Or <Link href="/account" className="text-blue-600 hover:underline">
                    login to your account
                  </Link>{' '}
                  to track all orders
                </p>
              </div>
            </Card>

            {/* Help Section */}
            <div className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Track Without Account</h2>
              <p className="text-gray-700 mb-4">
                All tracking features are available without login. Your tracking data is saved in your browser for
                convenience.
              </p>
              <Button asChild>
                <Link href="/account">Create Account for Full History</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Order Summary Card */}
            <Card className="p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Order Number</p>
                      <p className="font-bold text-gray-900">{trackingData?.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-bold text-gray-900">{trackingData?.orderDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Product</p>
                      <p className="font-bold text-gray-900">{trackingData?.product}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quantity</p>
                      <p className="font-bold text-gray-900">{trackingData?.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-bold text-gray-900">{trackingData?.total}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Current Status</p>
                    <p className="text-4xl font-bold text-blue-600 mb-4">{trackingData?.status}</p>
                    <p className="text-gray-700 mb-2">{trackingData?.currentLocation}</p>
                    <p className="text-sm text-gray-600">Last updated: {trackingData?.lastUpdated}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">Expected Delivery</p>
                    <p className="text-lg font-bold text-gray-900">{trackingData?.expectedDelivery}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tracking Timeline */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6">Delivery Timeline</h3>
              <div className="space-y-4">
                {trackingData?.timeline.map((item, idx) => (
                  <Card key={idx} className="p-6">
                    <div className="flex gap-6">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                            item.status === 'completed'
                              ? 'bg-green-100'
                              : item.status === 'current'
                                ? 'bg-blue-100'
                                : 'bg-gray-100'
                          }`}
                        >
                          {item.icon}
                        </div>
                        {idx < (trackingData?.timeline.length ?? 0) - 1 && (
                          <div
                            className={`w-1 h-16 mt-2 ${
                              item.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                            }`}
                          ></div>
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-gray-900">{item.step}</h4>
                          <span className="text-sm font-semibold text-gray-600">{item.date}</span>
                        </div>
                        <p className="text-gray-700">{item.details}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Actions */}
            <Card className="p-6 mb-8">
              <h3 className="font-bold mb-4">What You Can Do Now</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start">
                  📋 Add Delivery Instructions
                </Button>
                <Button variant="outline" className="justify-start">
                  📅 Reschedule Delivery
                </Button>
                <Button variant="outline" className="justify-start">
                  💬 Contact Support
                </Button>
              </div>
            </Card>

            {/* Need Help Section */}
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-6">Need Help?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 text-center">
                  <Phone className="w-8 h-8 mx-auto mb-4 text-gray-700" />
                  <h4 className="font-semibold mb-2">Call Us</h4>
                  <p className="text-gray-600 mb-4">+91-XXXX-XXXXXX</p>
                  <p className="text-sm text-gray-500">Mon-Sat, 10 AM - 7 PM</p>
                </Card>
                <Card className="p-6 text-center">
                  <Mail className="w-8 h-8 mx-auto mb-4 text-gray-700" />
                  <h4 className="font-semibold mb-2">Email Us</h4>
                  <p className="text-gray-600 mb-4">tracking@furnivo.com</p>
                  <p className="text-sm text-gray-500">Response within 24 hours</p>
                </Card>
                <Card className="p-6 text-center">
                  <MessageCircle className="w-8 h-8 mx-auto mb-4 text-gray-700" />
                  <h4 className="font-semibold mb-2">Live Chat</h4>
                  <p className="text-gray-600 mb-4">Available Now</p>
                  <p className="text-sm text-gray-500">Instant responses</p>
                </Card>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-bold mb-4">SMS & Email Updates</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox id="sms" defaultChecked />
                    <label htmlFor="sms" className="text-sm cursor-pointer">
                      Send SMS updates to +91-9876543210
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox id="email" defaultChecked />
                    <label htmlFor="email" className="text-sm cursor-pointer">
                      Send email updates to your email address
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Back to search */}
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setIsSearched(false);
                  setOrderId('');
                  setEmail('');
                  setTrackingId('');
                }}
              >
                Track Another Order
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
