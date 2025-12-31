'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MessageCircle, MessageSquare, MapPin, Clock, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const subjects = [
  'General Inquiry',
  'Product Question',
  'Order Status',
  'Delivery Issue',
  'Return/Exchange',
  'Design Consultation',
  'Bulk/Corporate Orders',
  'Technical Support',
  'Feedback/Complaint',
  'Other',
];

const stores = [
  {
    name: 'Mumbai - Worli',
    address: 'Delta House, Annie Besant Road, Worli, Mumbai - 400018, Maharashtra, India',
    phone: '+91-XXXX-XXXXXX',
    email: 'mumbai@furnivo.com',
    hours: 'Monday - Sunday: 10:00 AM - 7:00 PM',
    image: 'https://images.pexels.com/photos/1595578/pexels-photo-1595578.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    name: 'Goa - Porvorim',
    address: 'FC Goa House, NH 17, Porvorim, Goa - 403521, India',
    phone: '+91-XXXX-XXXXXX',
    email: 'goa@furnivo.com',
    hours: 'Monday - Sunday: 10:00 AM - 7:00 PM',
    image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

const faqCategories = [
  { icon: '🛍️', title: 'Order & Delivery', href: '/faq#ordering' },
  { icon: '↩️', title: 'Returns & Exchanges', href: '/faq#returns' },
  { icon: '💳', title: 'Payment & Pricing', href: '/faq#payment' },
];

const socialPlatforms = [
  { name: 'Instagram', handle: '@furnivo_india', followers: '50K+' },
  { name: 'Facebook', handle: 'Furnivo India', followers: '30K+' },
  { name: 'Pinterest', handle: 'Furnivo Design', followers: '25K+' },
  { name: 'YouTube', handle: 'Furnivo Home', followers: '15K+' },
  { name: 'LinkedIn', handle: 'Furnivo', followers: '5K+' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    orderNumber: '',
    message: '',
    agreeToPrivacy: false,
  });
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeToPrivacy: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeToPrivacy) {
      toast.error('Please agree to the privacy policy');
      return;
    }

    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: selectedSubject,
          orderNumber: formData.orderNumber || null,
          message: formData.message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit message');
      }

      // Generate reference number
      const refNum = `CT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      setReferenceNumber(refNum);
      setIsSubmitted(true);
      toast.success('Message sent successfully!');

      // Reset form after 5 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          orderNumber: '',
          message: '',
          agreeToPrivacy: false,
        });
        setSelectedSubject('');
        setIsSubmitted(false);
        setReferenceNumber('');
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="bg-gradient-to-b from-gray-100 to-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
              <Link href="/" className="hover:text-[#C47456]">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/contact" className="hover:text-[#C47456]">
                Contact
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center py-20 px-4">
          <Card className="w-full max-w-md p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Message Sent Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for contacting us. We've received your message and will respond within 24 hours to <strong>{formData.email}</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-6">Reference #: {referenceNumber}</p>
            <div className="space-y-3">
              <Button onClick={() => setIsSubmitted(false)} className="w-full">
                Send Another Message
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-100 to-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
            <Link href="/" className="hover:text-[#C47456]">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/contact" className="hover:text-[#C47456]">
              Contact
            </Link>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">Get In Touch</h1>
          <p className="text-lg text-gray-600">We're here to help. Reach out and we'll respond within 24 hours.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-2">Send Us a Message</h2>
              <p className="text-gray-600 mb-6">Fill out the form below and we'll get back to you shortly</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="mb-2">
                    Your Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="mb-2">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="mb-2">
                    Phone Number (optional)
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Subject */}
                <div>
                  <Label htmlFor="subject" className="mb-2">
                    Subject *
                  </Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject} required>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Order Number - Conditional */}
                {(selectedSubject === 'Order Status' || selectedSubject === 'Delivery Issue') && (
                  <div>
                    <Label htmlFor="orderNumber" className="mb-2">
                      Order Number (optional)
                    </Label>
                    <Input
                      id="orderNumber"
                      name="orderNumber"
                      placeholder="#12345"
                      value={formData.orderNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                {/* Message */}
                <div>
                  <Label htmlFor="message" className="mb-2">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Please describe your inquiry in detail..."
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    required
                    maxLength={500}
                  />
                  <p className="text-sm text-gray-500 mt-2">{formData.message.length}/500 characters</p>
                </div>

                {/* Privacy */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="privacy"
                    checked={formData.agreeToPrivacy}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="privacy" className="text-sm text-gray-600 cursor-pointer font-normal">
                    I agree to the Privacy Policy and consent to Furnivo contacting me regarding my inquiry
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>

              <div className="mt-8 pt-8 border-t">
                <p className="text-sm text-gray-600">
                  Prefer to talk? Call us at <strong>+91-XXXX-XXXXXX</strong> or email{' '}
                  <strong>hello@furnivo.com</strong>
                </p>
              </div>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Phone */}
            <Card className="p-6">
              <div className="flex gap-4 mb-4">
                <Phone className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Call Us</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">+91-XXXX-XXXXXX</p>
              <p className="text-sm text-gray-600 mb-1">Monday - Saturday: 10:00 AM - 7:00 PM</p>
              <p className="text-sm text-gray-500">Sunday: Closed</p>
            </Card>

            {/* Email */}
            <Card className="p-6">
              <div className="flex gap-4 mb-4">
                <Mail className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email Us</h3>
              <p className="text-lg font-bold text-gray-900 mb-2">hello@furnivo.com</p>
              <p className="text-sm text-gray-600">We respond within 24 hours</p>
            </Card>

            {/* Live Chat */}
            <Card className="p-6">
              <div className="flex gap-4 mb-4">
                <MessageCircle className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-gray-600 mb-3">Chat with our support team in real-time</p>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm font-medium">Online</span>
              </div>
              <Button variant="outline" className="w-full">
                Start Chat
              </Button>
            </Card>

            {/* WhatsApp */}
            <Card className="p-6">
              <div className="flex gap-4 mb-4">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">WhatsApp Us</h3>
              <p className="text-lg font-bold text-gray-900 mb-1">+91-XXXX-XXXXXX</p>
              <p className="text-xs text-gray-500 mb-3">Quick responses during business hours</p>
              <Button variant="outline" className="w-full">
                Chat on WhatsApp
              </Button>
            </Card>
          </div>
        </div>

        {/* Stores Section */}
        <div className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 my-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-2">Visit Us In Person</h2>
            <p className="text-gray-600 mb-12">
              Experience our furniture collections at our showrooms
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {stores.map((store) => (
                <Card key={store.name} className="overflow-hidden flex flex-col">
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold mb-4">{store.name}</h3>

                    <div className="space-y-4 flex-1">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Address</p>
                        <p className="text-gray-900">{store.address}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-2">Contact</p>
                        <p className="text-gray-900">{store.phone}</p>
                        <p className="text-gray-900">{store.email}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-2">Hours</p>
                        <p className="text-gray-900">{store.hours}</p>
                      </div>

                      <div className="flex gap-2 text-sm text-gray-600">
                        <span>🅿️ Parking</span>
                        <span>🎨 Design Consultation</span>
                        <span>♿ Accessible</span>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" className="flex-1">
                        Get Directions
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Call Store
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Quick Links */}
        <div className="py-12">
          <h2 className="text-3xl font-bold mb-2">Looking for Quick Answers?</h2>
          <p className="text-gray-600 mb-8">Check out our most frequently asked questions</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {faqCategories.map((category) => (
              <Card key={category.title} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-3xl mb-4">{category.icon}</div>
                <h3 className="font-semibold mb-4">{category.title}</h3>
                <Link href={category.href} className="text-blue-600 hover:text-blue-700">
                  View FAQs →
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Business Inquiries */}
        <div className="bg-amber-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 my-8 rounded-lg">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-2">Business & Corporate Inquiries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Bulk Orders & Contract Furniture</h3>
                <p className="text-gray-700 mb-4">
                  Looking to furnish hotels, offices, or residential projects? We offer special pricing for
                  bulk orders and work closely with architects and interior designers.
                </p>
                <p className="text-gray-700">
                  Email: <strong>corporate@furnivo.com</strong>
                </p>
                <p className="text-gray-700">
                  Phone: <strong>+91-XXXX-XXXXXX</strong>
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Franchise Opportunities</h3>
                <p className="text-gray-700 mb-4">
                  Interested in bringing Furnivo to your city? We're always looking for passionate partners.
                </p>
                <Button>Download Franchise Brochure</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="py-12">
          <h2 className="text-3xl font-bold mb-2">Connect With Us</h2>
          <p className="text-gray-600 mb-8">
            Follow us for design inspiration, new arrivals, and exclusive offers
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {socialPlatforms.map((platform) => (
              <Card key={platform.name} className="p-4 text-center hover:shadow-lg transition-shadow">
                <p className="text-2xl mb-2">📱</p>
                <h4 className="font-semibold mb-1">{platform.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{platform.followers}</p>
                <Button variant="outline" size="sm" className="w-full">
                  Follow
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-gray-900 text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12 rounded-lg mt-8">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
            <p className="text-gray-300 mb-6">
              Subscribe to get design tips, new arrivals, and exclusive offers
            </p>
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white text-gray-900"
              />
              <Button>Subscribe</Button>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}