'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Truck, Zap, Crown, MapPin, Clock, AlertCircle, Phone, Mail, MessageCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const shippingOptions = [
  {
    name: 'Standard Delivery',
    icon: Truck,
    time: '2-4 weeks',
    cost: 'FREE on orders above ₹50,000',
    coverage: 'All major cities in India',
    badge: null,
    included: [
      'Doorstep delivery',
      'SMS/Email tracking updates',
      'Delivery appointment scheduling',
      'Basic unboxing assistance',
    ],
    excluded: ['Assembly service', 'Old furniture removal'],
  },
  {
    name: 'Express Delivery',
    icon: Zap,
    time: '7-10 business days',
    cost: '₹2,500 (flat rate)',
    coverage: 'Select metro cities',
    badge: 'FASTEST',
    included: [
      'Everything in Standard',
      'Priority processing',
      'Guaranteed delivery window (4-hour slot)',
      'Express tracking',
    ],
    excluded: ['Assembly service'],
  },
  {
    name: 'White Glove Delivery',
    icon: Crown,
    time: '2-4 weeks',
    cost: '₹5,000',
    coverage: 'All serviceable areas',
    badge: 'PREMIUM',
    included: [
      'Everything in Standard & Express',
      'Full assembly & installation',
      'Placement in room of choice',
      'Packaging removal & disposal',
      'Quality inspection',
    ],
    excluded: [],
  },
];

const timelineSteps = [
  {
    title: 'Order Placed',
    day: 'Day 0',
    icon: '🛒',
    description: 'Order confirmation email sent immediately',
  },
  {
    title: 'Processing',
    day: '1-3 days',
    icon: '📦',
    description: 'Quality check & packaging',
  },
  {
    title: 'Dispatched',
    day: 'Day 3-5',
    icon: '🚚',
    description: 'Your order leaves our facility',
  },
  {
    title: 'In Transit',
    day: '1-3 weeks',
    icon: '🚛',
    description: 'Your order is on the way',
  },
  {
    title: 'Out for Delivery',
    day: 'Delivery Day',
    icon: '📍',
    description: 'Our team will contact you 24 hours before',
  },
  {
    title: 'Delivered',
    day: 'Day of Delivery',
    icon: '✅',
    description: 'Product delivered and inspected',
  },
];

const zoneData = [
  {
    zone: 'Zone 1 (Metro Cities)',
    coverage: 'Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune',
    standard: 'FREE (₹50k+) / ₹500',
    express: '₹2,500',
    whiteGlove: '₹5,000',
  },
  {
    zone: 'Zone 2 (Tier 1 Cities)',
    coverage: 'Ahmedabad, Jaipur, Lucknow, Chandigarh, Kochi, etc.',
    standard: 'FREE (₹50k+) / ₹800',
    express: '₹3,000',
    whiteGlove: '₹6,000',
  },
  {
    zone: 'Zone 3 (Tier 2/3 Cities)',
    coverage: 'Other serviceable cities',
    standard: 'FREE (₹60k+) / ₹1,200',
    express: 'Not Available',
    whiteGlove: '₹7,500',
  },
];

const faqs = [
  {
    q: 'Can I change my delivery address after ordering?',
    a: 'Yes, if the order hasn\'t been dispatched. Contact us immediately at hello@furnivo.com or call +91-XXXX-XXXXXX. Changes may incur additional charges.',
  },
  {
    q: 'What if I\'m not home during delivery?',
    a: 'Delivery requires an adult signature. If you\'re unavailable, we\'ll reschedule. Multiple reschedules may incur charges of ₹500 per attempt.',
  },
  {
    q: 'Do you deliver to PO Boxes?',
    a: 'No, we only deliver to physical addresses where furniture can be properly received.',
  },
  {
    q: 'Can I schedule delivery for a specific date?',
    a: 'Yes, during checkout select "Schedule Delivery" and choose your preferred date (subject to availability).',
  },
  {
    q: 'What if my item is damaged during shipping?',
    a: 'Inspect thoroughly before signing. Report damage immediately to delivery team and contact us within 48 hours with photos. We\'ll arrange replacement or repair.',
  },
  {
    q: 'Are there items you cannot ship?',
    a: 'Due to size/weight restrictions, some items may not be available in certain areas. Check product page or contact us.',
  },
  {
    q: 'Can I pickup my order instead of delivery?',
    a: 'Yes! Free pickup available at our Mumbai and Goa stores. Select "Store Pickup" at checkout.',
  },
  {
    q: 'Do you offer weekend deliveries?',
    a: 'Yes, Saturday deliveries available. Sunday deliveries available for White Glove service with advance booking.',
  },
];

export default function ShippingPage() {
  const [activeTab, setActiveTab] = useState('shipping-options');
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<null | { serviceable: boolean; time: string; cost: string }>(null);

  const handlePincodeCheck = () => {
    if (!pincode) return;
    // Mock pincode check
    setPincodeResult({
      serviceable: true,
      time: '2-4 weeks',
      cost: 'FREE',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-100 to-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
                   <Link href="/" className="hover:text-[#C47456]">Home</Link>
                   <ChevronRight className="w-4 h-4" />
                   <Link href="/shipping" className="hover:text-[#C47456]">
                   Shipping
                   </Link>
                 </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">Shipping & Delivery</h1>
          <p className="text-lg text-gray-600">
            Everything you need to know about our delivery process
          </p>
        </div>
      </div>

      {/* Quick Navigation Tabs */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-0">
            <button
              onClick={() => setActiveTab('shipping-options')}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'shipping-options'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Shipping Options
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'timeline'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Delivery Timeline
            </button>
            <button
              onClick={() => setActiveTab('costs')}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'costs'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Shipping Costs
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'track'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Track Your Order
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'faq'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              FAQs
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section 1: Shipping Options */}
        {activeTab === 'shipping-options' && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Choose Your Delivery Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {shippingOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card key={option.name} className="p-6 relative">
                    {option.badge && (
                      <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">
                        {option.badge}
                      </div>
                    )}
                    <Icon className="w-8 h-8 mb-4 text-gray-700" />
                    <h3 className="text-xl font-bold mb-2">{option.name}</h3>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Delivery Time</p>
                      <p className="text-lg font-semibold text-gray-900">{option.time}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Cost</p>
                      <p className="text-lg font-semibold text-gray-900">{option.cost}</p>
                    </div>
                    <div className="mb-6">
                      <p className="text-sm text-gray-600">Coverage</p>
                      <p className="text-gray-900">{option.coverage}</p>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold mb-2">What's Included:</p>
                      <ul className="space-y-2 mb-4">
                        {option.included.map((item) => (
                          <li key={item} className="flex gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      {option.excluded.length > 0 && (
                        <>
                          <p className="text-sm font-semibold mb-2">Not Included:</p>
                          <ul className="space-y-1">
                            {option.excluded.map((item) => (
                              <li key={item} className="text-sm text-gray-500 line-through">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                    <Button className="w-full mt-6">Learn More</Button>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: Timeline */}
        {activeTab === 'timeline' && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Understanding Your Delivery Timeline</h2>
            <div className="space-y-4">
              {timelineSteps.map((step, idx) => (
                <Card key={step.title} className="p-6">
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="text-3xl mb-4">{step.icon}</div>
                      {idx < timelineSteps.length - 1 && <div className="w-1 h-20 bg-gray-200 mt-2"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold">{step.title}</h3>
                        <span className="text-sm font-semibold text-gray-600">{step.day}</span>
                      </div>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Card className="p-4 mt-8 bg-blue-50 border-blue-200">
              <p className="text-sm text-gray-700">
                <AlertCircle className="w-4 h-4 inline mr-2 text-blue-600" />
                Delivery times may vary based on product availability and your location. Custom/Made-to-order
                items may take 4-6 weeks.
              </p>
            </Card>
          </div>
        )}

        {/* Section 3: Costs */}
        {activeTab === 'costs' && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Shipping Costs by Location</h2>

            <div className="mb-8 overflow-x-auto">
              <table className="w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Zone</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Coverage</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Standard</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Express</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">White Glove</th>
                  </tr>
                </thead>
                <tbody>
                  {zoneData.map((zone) => (
                    <tr key={zone.zone} className="border-b hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 font-semibold">{zone.zone}</td>
                      <td className="border border-gray-200 px-4 py-3 text-sm">{zone.coverage}</td>
                      <td className="border border-gray-200 px-4 py-3">{zone.standard}</td>
                      <td className="border border-gray-200 px-4 py-3">{zone.express}</td>
                      <td className="border border-gray-200 px-4 py-3">{zone.whiteGlove}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Check Your Serviceability</h3>
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Enter your pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
                <Button onClick={handlePincodeCheck}>Check</Button>
              </div>
              {pincodeResult && (
                <div className="mt-4 p-4 bg-white rounded border border-blue-200">
                  {pincodeResult.serviceable ? (
                    <>
                      <p className="text-green-600 font-semibold flex items-center gap-2">
                        <Check className="w-4 h-4" /> Serviceable
                      </p>
                      <p className="text-gray-700 mt-2">Delivery Time: {pincodeResult.time}</p>
                      <p className="text-gray-700">Shipping Cost: {pincodeResult.cost}</p>
                    </>
                  ) : (
                    <p className="text-red-600 font-semibold">Not Serviceable</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 4: Track Order */}
        {activeTab === 'track' && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Track Your Shipment</h2>
            <Card className="p-8 bg-blue-50 border-blue-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Order Number</label>
                  <Input placeholder="#FRN123456" />
                </div>
                <div className="text-center text-gray-600">Or</div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Tracking Number</label>
                  <Input placeholder="TR1234567890" />
                </div>
                <Button className="w-full">Track Order</Button>
              </div>
            </Card>
            <p className="text-sm text-gray-600 mt-6">
              Find your order number in confirmation email or SMS
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Or <Link href="/track-order" className="text-blue-600 hover:underline">login to your account</Link> to track all orders
            </p>
          </div>
        )}

        {/* Section 5: FAQs */}
        {activeTab === 'faq' && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Shipping FAQs</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-lg">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 text-gray-700">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Need Help Section */}
        <div className="mt-16 pt-12 border-t">
          <h2 className="text-2xl font-bold text-center mb-8">Still Have Questions About Shipping?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <Phone className="w-8 h-8 mx-auto mb-4 text-gray-700" />
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600 mb-4">+91-XXXX-XXXXXX</p>
              <p className="text-sm text-gray-500">Mon-Sat, 10 AM - 7 PM</p>
            </Card>
            <Card className="p-6 text-center">
              <Mail className="w-8 h-8 mx-auto mb-4 text-gray-700" />
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600 mb-4">shipping@furnivo.com</p>
              <p className="text-sm text-gray-500">Response within 24 hours</p>
            </Card>
            <Card className="p-6 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-4 text-gray-700" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Click to start chat</p>
              <p className="text-sm text-gray-500">If available</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

