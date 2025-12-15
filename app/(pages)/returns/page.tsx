'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, AlertCircle, Phone, Mail, MessageCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const eligibleItems = [
  'Items in original, unused condition',
  'All original packaging, tags, and accessories included',
  'No signs of assembly or use',
  'Purchased within last 30 days',
  'Standard products (not custom-made)',
  'Sale items (eligible for exchange or store credit only)',
];

const nonEligibleItems = [
  'Custom or made-to-order items',
  'Clearance/Final sale items (marked as such)',
  'Assembled products',
  'Products showing signs of use, wear, or damage',
  'Items without original packaging',
  'Products purchased more than 30 days ago',
  'Mattresses and bedding (hygiene reasons)',
];

const returnSteps = [
  {
    number: 1,
    title: 'Initiate Return Request',
    timeline: 'Within 30 days of delivery',
    details: [
      'Online: Login to account → Orders → Select item → "Request Return"',
      'Phone: Call +91-XXXX-XXXXXX',
      'Email: returns@furnivo.com with order number',
    ],
  },
  {
    number: 2,
    title: 'Return Approval',
    timeline: 'Within 24-48 hours',
    details: [
      'We\'ll review your request',
      'You\'ll receive RMA number and return instructions',
      'Status updates via email and SMS',
    ],
  },
  {
    number: 3,
    title: 'Schedule Pickup',
    timeline: 'Within 2-3 business days',
    details: [
      'Free pickup: For orders over ₹25,000',
      'Self-drop: Bring to nearest store',
      'Courier: Use provided shipping label',
    ],
  },
  {
    number: 4,
    title: 'Quality Inspection',
    timeline: '3-5 business days after receipt',
    details: [
      'Our team inspects the returned item',
      'Verification of condition, components, and packaging',
      'You\'ll receive inspection report via email',
    ],
  },
  {
    number: 5,
    title: 'Refund/Exchange Processing',
    timeline: '5-7 business days post-inspection',
    details: [
      'Refund to original payment method',
      'Or receive new item with no additional shipping charges',
      'Or store credit (valid for 1 year)',
    ],
  },
];

const faqs = [
  {
    q: 'Can I return furniture I assembled?',
    a: 'Unfortunately, no. Products must be in original, unassembled condition with all packaging.',
  },
  {
    q: 'I lost my packaging. Can I still return?',
    a: 'Contact us at returns@furnivo.com. We may be able to provide replacement packaging for a fee (₹500-₹2,000).',
  },
  {
    q: 'How do I return a large item like a sofa?',
    a: 'We\'ll arrange pickup. Ensure item is accessible and ready for pickup on scheduled date.',
  },
  {
    q: 'Can I exchange a sale item for a regular-priced item?',
    a: 'Yes, you\'ll receive store credit for the sale price, which can be used toward any product.',
  },
  {
    q: 'What if the replacement is also damaged?',
    a: 'We\'ll offer a full refund or you can choose a different product. We\'ll also provide compensation for inconvenience.',
  },
  {
    q: 'Do I get refunded for assembly charges?',
    a: 'Assembly charges are non-refundable unless the product is defective.',
  },
  {
    q: 'Can I return part of an order?',
    a: 'Yes, you can return individual items from a multi-item order.',
  },
  {
    q: 'What if I\'m past the 30-day window?',
    a: 'Contact us anyway. We evaluate on case-by-case basis and may offer store credit or exchange.',
  },
];

export default function ReturnsPage() {
  const [activeSection, setActiveSection] = useState('policy');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-100 to-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
                   <Link href="/" className="hover:text-[#C47456]">Home</Link>
                   <ChevronRight className="w-4 h-4" />
                   <Link href="/returns" className="hover:text-[#C47456]">
                     Return Items
                   </Link>
                 </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">Returns & Exchanges</h1>
          <p className="text-lg text-gray-600">We want you to love your furniture. If you don't, we'll make it right.</p>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="bg-blue-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-lg font-bold mb-4">30-Day Return Policy at a Glance:</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>30 days to return or exchange</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Free returns on eligible items</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Full refund or store credit</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Items must be in original condition with all packaging</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section 1: Eligibility */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8">What Can Be Returned?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Eligible for Return
              </h3>
              <ul className="space-y-3">
                {eligibleItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <X className="w-5 h-5 text-red-600" />
                Not Eligible for Return
              </h3>
              <ul className="space-y-3">
                {nonEligibleItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Card className="mt-8 p-4 bg-amber-50 border-amber-200">
            <h4 className="font-semibold mb-2">Special Cases:</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Damaged/Defective items:</strong> Returnable within 48 hours of delivery
              </li>
              <li>
                <strong>Wrong item delivered:</strong> Full return accepted within 7 days
              </li>
            </ul>
          </Card>
        </section>

        {/* Section 2: Return Process */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8">How to Return Your Order</h2>
          <div className="space-y-4">
            {returnSteps.map((step) => (
              <Card key={step.number} className="p-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">{step.title}</h3>
                      <span className="text-sm font-semibold text-gray-600">{step.timeline}</span>
                    </div>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="text-gray-700 text-sm flex gap-2">
                          <span className="text-blue-600">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 3: Exchange Policy */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Need a Different Size or Color?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Same Product Exchange</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Different size, color, or configuration</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>No additional charges if same price</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Price difference adjusted if applicable</span>
                </li>
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Different Product Exchange</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Exchange for any product of equal or greater value</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Pay difference if new product costs more</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Receive store credit if costs less</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Section 4: Return Shipping */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Who Pays for Return Shipping?</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Return Reason</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Pickup By</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-3">Changed mind / Don't like</td>
                  <td className="border border-gray-200 px-4 py-3">Customer request</td>
                  <td className="border border-gray-200 px-4 py-3 font-semibold">
                    FREE (orders ₹25k+) / ₹500-₹1,500 (orders &lt;₹25k)
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-3">Wrong item delivered</td>
                  <td className="border border-gray-200 px-4 py-3">Furnivo</td>
                  <td className="border border-gray-200 px-4 py-3 font-semibold">FREE</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-3">Damaged/Defective</td>
                  <td className="border border-gray-200 px-4 py-3">Furnivo</td>
                  <td className="border border-gray-200 px-4 py-3 font-semibold">FREE</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: Damaged Items */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Received a Damaged or Defective Product?</h2>
          <Card className="p-6 bg-red-50 border-red-200 mb-6">
            <p className="font-bold text-red-600">Important: Report Within 48 Hours</p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Immediate Actions:</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>Do NOT discard packaging</span>
                </li>
                <li className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>Take clear photos (overall, damaged areas, packaging)</span>
                </li>
                <li className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>Contact us immediately</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Options:</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <Phone className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" />
                  <span>Phone: +91-XXXX-XXXXXX (Priority line)</span>
                </li>
                <li className="flex gap-2">
                  <Mail className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" />
                  <span>Email: urgent@furnivo.com</span>
                </li>
              </ul>
            </div>
          </div>

          <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
            <h3 className="font-bold mb-3">Resolution Options:</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Replacement:</strong> Brand new product with fast-tracked delivery (3-5 days)
                </span>
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Repair:</strong> Technician visit for minor damages
                </span>
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Full Refund:</strong> Immediate refund processing
                </span>
              </li>
            </ul>
          </Card>
        </section>

        {/* Section 6: FAQs */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Return FAQs</h2>
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
        </section>

        {/* Start Return Section */}
        <section className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12 rounded-lg">
          <h2 className="text-3xl font-bold text-center mb-8">Ready to Return or Exchange?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="text-3xl mb-4">💻</div>
              <h3 className="font-semibold mb-2">Start Return Online</h3>
              <p className="text-sm text-gray-600 mb-4">Fastest option - Get instant RMA</p>
              <Button asChild className="w-full">
                <Link href="/account">Login to Your Account</Link>
              </Button>
            </Card>
            <Card className="p-6 text-center">
              <Phone className="w-8 h-8 mx-auto mb-4 text-gray-700" />
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-gray-900 font-bold mb-2">+91-XXXX-XXXXXX</p>
              <p className="text-sm text-gray-600 mb-4">Mon-Sat, 10 AM - 7 PM</p>
              <Button variant="outline" className="w-full">
                Call Now
              </Button>
            </Card>
            <Card className="p-6 text-center">
              <Mail className="w-8 h-8 mx-auto mb-4 text-gray-700" />
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-gray-900 font-bold mb-2">returns@furnivo.com</p>
              <p className="text-sm text-gray-600 mb-4">Response within 24 hours</p>
              <Button variant="outline" className="w-full">
                Send Email
              </Button>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
