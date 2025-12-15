'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Phone, Mail, MessageCircle, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqCategories = [
  {
    id: 'ordering',
    icon: '🛒',
    title: 'Ordering & Payment',
    count: 12,
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit/debit cards (Visa, Mastercard, American Express, RuPay), UPI (Google Pay, PhonePe, Paytm), Net Banking, Cash on Delivery (for eligible orders), and EMI options for orders above ₹30,000.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes, absolutely. We use 256-bit SSL encryption and are PCI-DSS compliant. We never store your complete card details on our servers.',
      },
      {
        q: 'Can I use multiple payment methods for one order?',
        a: 'Currently, one payment method per order. However, you can use a combination of store credit/gift card + one primary payment method.',
      },
      {
        q: 'Do you offer EMI options?',
        a: 'Yes, for orders above ₹30,000. Available EMI tenures: 3, 6, 9, and 12 months. Check available plans during checkout.',
      },
      {
        q: 'Can I pay in installments without a credit card?',
        a: 'Yes, through our partner services like LazyPay, Simpl, and ZestMoney at checkout.',
      },
      {
        q: 'What is Cash on Delivery (COD) limit?',
        a: 'COD available for orders up to ₹50,000. Additional verification may be required for high-value orders.',
      },
      {
        q: 'Can I get an invoice for my purchase?',
        a: 'Yes, invoice is automatically emailed after order placement. Also available in your account under Orders → Invoice Download.',
      },
      {
        q: 'Do you charge sales tax/GST?',
        a: 'Yes, GST is applicable as per Indian tax laws. Price displayed includes GST. Detailed tax breakdown shown at checkout.',
      },
      {
        q: 'Can I modify my order after payment?',
        a: 'Yes, before shipment. Contact us immediately at hello@furnivo.com or +91-XXXX-XXXXXX. Changes may affect delivery time.',
      },
      {
        q: 'What if my payment failed but amount was deducted?',
        a: 'This is a temporary hold. Amount will be automatically refunded to your account within 5-7 business days. Contact your bank if not refunded.',
      },
      {
        q: 'Do you accept international cards?',
        a: 'Yes, international credit/debit cards are accepted. Ensure international transactions are enabled on your card.',
      },
      {
        q: 'Can I order over the phone?',
        a: 'Yes! Call us at +91-XXXX-XXXXXX (Mon-Sat, 10 AM - 7 PM). Our team will assist with order placement.',
      },
    ],
  },
  {
    id: 'shipping',
    icon: '🚚',
    title: 'Shipping & Delivery',
    count: 12,
    questions: [
      {
        q: 'How long does delivery take?',
        a: 'Standard delivery: 2-4 weeks. Express delivery: 7-10 days. White Glove: 2-4 weeks scheduled at your convenience. Custom orders: 4-6 weeks.',
      },
      {
        q: 'Do you offer free shipping?',
        a: 'Yes, free standard shipping on orders above ₹50,000. Orders below this have shipping charges based on location and item size.',
      },
      {
        q: 'How can I track my order?',
        a: 'Track via: (1) Account → Orders → Track, (2) Tracking link in email/SMS, (3) Enter order number at furnivo.com/track, (4) Call +91-XXXX-XXXXXX.',
      },
      {
        q: 'What areas do you deliver to?',
        a: 'We deliver to all major cities and most towns across India. Enter your pincode at checkout to verify serviceability.',
      },
      {
        q: 'Can I change delivery address after ordering?',
        a: 'Yes, if order hasn\'t shipped. Contact us immediately. Address change may incur additional charges depending on location.',
      },
      {
        q: 'Do you deliver on weekends?',
        a: 'Saturday deliveries available. Sunday deliveries for White Glove service with advance booking (additional charges may apply).',
      },
      {
        q: 'What if I\'m not home during delivery?',
        a: 'Delivery requires adult signature. If unavailable, we\'ll reschedule. Please inform us in advance to avoid redelivery charges.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes, to select countries: USA, UK, UAE, Australia, Canada, Singapore. Contact global@furnivo.com for quote and details.',
      },
      {
        q: 'Can furniture be delivered to apartments?',
        a: 'Yes. Ensure elevators are large enough or inform us about stairs (additional charges for manual carrying may apply).',
      },
      {
        q: 'What is White Glove delivery?',
        a: 'Premium service including assembly, placement, packaging removal, and old furniture disposal. ₹5,000 for most items.',
      },
      {
        q: 'Can I schedule a specific delivery date?',
        a: 'Yes, select "Schedule Delivery" at checkout and choose your preferred date (subject to availability).',
      },
      {
        q: 'What if delivery is delayed?',
        a: 'We\'ll notify you immediately. You can reschedule or cancel for full refund if delay exceeds 7 days beyond promised date.',
      },
    ],
  },
  {
    id: 'returns',
    icon: '📦',
    title: 'Returns & Exchanges',
    count: 12,
    questions: [
      {
        q: 'What is your return policy?',
        a: '30-day return policy. Items must be unused, in original packaging. Free returns on orders ₹25k+. Full refund or store credit.',
      },
      {
        q: 'Can I return assembled furniture?',
        a: 'No. Furniture must be unassembled and in original condition with all packaging to be eligible for return.',
      },
      {
        q: 'How do I initiate a return?',
        a: 'Login → Account → Orders → Request Return. Or call/email us with order number. You\'ll receive RMA number and return instructions.',
      },
      {
        q: 'Who pays for return shipping?',
        a: 'Free return pickup for orders ₹25k+. For others, ₹500-₹1,500 based on item size. Free returns for wrong/damaged items.',
      },
      {
        q: 'How long does refund take?',
        a: '5-7 business days after product inspection. Credit/debit cards: 5-7 days. UPI: 3-5 days. Bank transfer (COD): 7-10 days.',
      },
      {
        q: 'Can I exchange for a different product?',
        a: 'Yes! Exchange for any product of equal or greater value. Pay difference if more expensive, receive credit if less.',
      },
      {
        q: 'Can I return sale items?',
        a: 'Sale items can be exchanged or returned for store credit only (no cash refund). Items marked "Final Sale" cannot be returned.',
      },
      {
        q: 'What if I received a damaged item?',
        a: 'Report within 48 hours with photos. We\'ll send replacement or full refund (your choice). Pickup arranged at no cost.',
      },
      {
        q: 'Can custom orders be returned?',
        a: 'Custom/made-to-order items cannot be returned unless defective. All customizations are final.',
      },
      {
        q: 'What if I lost the packaging?',
        a: 'Contact returns@furnivo.com. We may provide replacement packaging for ₹500-₹2,000 depending on item size.',
      },
      {
        q: 'Is there a restocking fee?',
        a: 'No restocking fee for standard returns. Large items (₹50k+) may have 10% fee if unboxed. Custom orders: 25% if canceled after production.',
      },
      {
        q: 'Can I return a gift?',
        a: 'Yes, with gift receipt. Store credit issued unless gift giver requests refund to original payment method.',
      },
    ],
  },
  {
    id: 'account',
    icon: '👤',
    title: 'Account & Profile',
    count: 10,
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click "Sign Up" in top navigation. Enter email, create password. Or sign up during checkout. You can also use Google/Facebook login.',
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Click "Forgot Password" on login page. Enter your email. You\'ll receive a password reset link within minutes.',
      },
      {
        q: 'How do I change my email address?',
        a: 'Login → Account Settings → Personal Information → Edit Email. Verify new email via OTP sent to your phone.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. Account Settings → Delete Account. Note: This is permanent and deletes all order history, wishlist, and saved data.',
      },
      {
        q: 'How do I save multiple addresses?',
        a: 'Account → Saved Addresses → Add New Address. Save home, office, or other addresses for quick checkout.',
      },
      {
        q: 'Can I set a default address?',
        a: 'Yes. In Saved Addresses, click "Set as Default" on your preferred address. This will auto-fill at checkout.',
      },
      {
        q: 'How do I view my order history?',
        a: 'Account → Orders. View all past orders, track current orders, download invoices, and initiate returns.',
      },
      {
        q: 'Can I have multiple accounts with same email?',
        a: 'No, each email can have only one account. Use different emails for separate accounts.',
      },
      {
        q: 'How do I update my phone number?',
        a: 'Account Settings → Personal Information → Edit Phone. Verify via OTP sent to new number.',
      },
      {
        q: 'What is store credit and how do I use it?',
        a: 'Store credit from returns/promotions is added to your account. Automatically applied at checkout or manually select amount to use.',
      },
    ],
  },
  {
    id: 'products',
    icon: '🛋️',
    title: 'Products & Customization',
    count: 12,
    questions: [
      {
        q: 'Are your products made in India?',
        a: 'Most products are designed and manufactured in India. Some premium lines use imported materials while maintaining Indian craftsmanship.',
      },
      {
        q: 'Can I customize furniture dimensions?',
        a: 'Yes, many products allow up to 20% size adjustment. Check product page for "Customizable" badge or contact design team.',
      },
      {
        q: 'What materials are used in your furniture?',
        a: 'We use solid wood (oak, walnut, teak), engineered wood, premium fabrics, genuine leather, metal, and tempered glass. Details on each product page.',
      },
      {
        q: 'Do you use real leather?',
        a: 'Yes, genuine leather options available. We also offer premium faux leather (vegan) and fabric alternatives.',
      },
      {
        q: 'Are your products eco-friendly?',
        a: 'Yes. We use FSC-certified wood, low-VOC finishes, recycled materials where possible, and sustainable manufacturing practices.',
      },
      {
        q: 'What is FSC-certified wood?',
        a: 'Forest Stewardship Council certified wood from responsibly managed forests ensuring environmental and social standards.',
      },
      {
        q: 'Can I see products in person before buying?',
        a: 'Yes! Visit our showrooms in Mumbai (Worli) and Goa (Porvorim). See full collection, touch materials, test comfort.',
      },
      {
        q: 'Do you provide fabric/material samples?',
        a: 'Yes, order up to 5 samples for ₹500 (refundable on purchase). Delivered in 3-5 days. Order via product page or call us.',
      },
      {
        q: 'How do I choose the right size furniture?',
        a: 'Each product page has detailed dimensions. Use our Room Planner tool (website) or book free design consultation for expert advice.',
      },
      {
        q: 'What warranty do you offer?',
        a: '5-year structural warranty on most furniture. 1-year on upholstery and fabrics. Warranty details on product page.',
      },
      {
        q: 'Can I request a product not on your website?',
        a: 'Yes! Contact custom@furnivo.com with details, images, dimensions. We\'ll provide quote and timeline for custom manufacturing.',
      },
      {
        q: 'How do I care for wooden furniture?',
        a: 'Dust regularly with soft cloth. Use wood polish quarterly. Avoid direct sunlight and moisture. Detailed care guide with each product.',
      },
    ],
  },
  {
    id: 'assembly',
    icon: '🔧',
    title: 'Assembly & Care',
    count: 12,
    questions: [
      {
        q: 'Do products come assembled?',
        a: 'Most items require assembly. Assembly difficulty rated on product page (Easy/Moderate/Expert). Instructions included.',
      },
      {
        q: 'Do you offer assembly services?',
        a: 'Yes. Small items: ₹500. Medium: ₹1,500. Large: ₹3,000. White Glove delivery includes full assembly.',
      },
      {
        q: 'Are assembly instructions provided?',
        a: 'Yes, printed instructions in box. Also available as video tutorials on our YouTube channel and product pages.',
      },
      {
        q: 'What tools are needed for assembly?',
        a: 'Most items need basic tools (included). Complex items may need power drill (we\'ll specify on product page).',
      },
      {
        q: 'Can I hire someone else to assemble?',
        a: 'Yes, but must be professional. DIY assembly by untrained persons may void warranty.',
      },
      {
        q: 'How do I clean upholstered furniture?',
        a: 'Vacuum regularly. Spot clean spills immediately with mild soap. Professional cleaning recommended yearly. Detailed care card with product.',
      },
      {
        q: 'Can I get replacement parts?',
        a: 'Yes. Contact support with product name and part needed. Most parts available. Small parts often sent free, larger parts at cost.',
      },
      {
        q: 'How do I remove scratches from wood?',
        a: 'Minor scratches: use furniture touch-up pen (color-matched, available on our site). Deep scratches may need professional refinishing.',
      },
      {
        q: 'What if I damage furniture during assembly?',
        a: 'Contact us immediately. We\'ll assess and provide replacement parts if available. Assembly service damage covered under service warranty.',
      },
      {
        q: 'How often should I condition leather?',
        a: 'Every 6-12 months using leather conditioner. Avoid harsh chemicals. Keep away from direct heat/sunlight.',
      },
      {
        q: 'Can I reupholster my furniture later?',
        a: 'Yes. Contact us for reupholstery services. Or take to any professional upholsterer. Fabric options available in our fabric library.',
      },
      {
        q: 'What if I lose assembly instructions?',
        a: 'Download from product page or email support@furnivo.com with product name. We\'ll send PDF immediately.',
      },
    ],
  },
];

const popularQuestions = [
  'How long does delivery take?',
  'What is your return policy?',
  'Do you offer assembly services?',
  'How can I track my order?',
  'What payment methods do you accept?',
  'Do you ship internationally?',
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState('ordering');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return faqCategories;

    const query = searchQuery.toLowerCase();
    return faqCategories
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (q) =>
            q.q.toLowerCase().includes(query) ||
            q.a.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-100 to-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
                   <Link href="/" className="hover:text-[#C47456]">Home</Link>
                   <ChevronRight className="w-4 h-4" />
                   <Link href="/faq" className="hover:text-[#C47456]">
                     Faqs
                   </Link>
                 </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600 mb-8">
            Find answers to common questions about our products, orders, and services
          </p>

          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Popular Questions */}
        {!searchQuery && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Popular Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularQuestions.map((question) => {
                const category = faqCategories.find((cat) =>
                  cat.questions.some((q) => q.q === question)
                );
                return (
                  <Card
                    key={question}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      if (category) {
                        setExpandedCategory(category.id);
                        setSearchQuery(question);
                      }
                    }}
                  >
                    <p className="font-semibold text-gray-900 text-sm">{question}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              Showing {filteredCategories.reduce((sum, cat) => sum + cat.questions.length, 0)} results for{' '}
              <strong>"{searchQuery}"</strong>
            </p>
          </div>
        )}

        {/* FAQ Categories */}
        {filteredCategories.length > 0 ? (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <div key={category.id} id={category.id}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{category.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold">{category.title}</h2>
                    <p className="text-sm text-gray-600">({category.questions.length} questions)</p>
                  </div>
                </div>

                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((faq, idx) => (
                    <AccordionItem
                      key={`${category.id}-${idx}`}
                      value={`${category.id}-${idx}`}
                      className="border rounded-lg"
                    >
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
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              No matches found. Try different keywords or browse categories below.
            </p>
            <Button onClick={() => setSearchQuery('')}>View All FAQs</Button>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-16 pt-12 border-t">
          <h2 className="text-2xl font-bold text-center mb-8">Can't Find Your Answer?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <Phone className="w-8 h-8 mx-auto mb-4 text-gray-700" />
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600 mb-4">+91-XXXX-XXXXXX</p>
              <p className="text-sm text-gray-500 mb-4">Mon-Sat, 10 AM - 7 PM</p>
              <Button variant="outline" className="w-full">
                Call Now
              </Button>
            </Card>
            <Card className="p-6 text-center">
              <Mail className="w-8 h-8 mx-auto mb-4 text-gray-700" />
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600 mb-4">hello@furnivo.com</p>
              <p className="text-sm text-gray-500 mb-4">Response within 24 hours</p>
              <Button variant="outline" className="w-full">
                Send Email
              </Button>
            </Card>
            <Card className="p-6 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-4 text-gray-700" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Available Now</p>
              <p className="text-sm text-gray-500 mb-4">Instant responses</p>
              <Button variant="outline" className="w-full">
                Start Chat
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
