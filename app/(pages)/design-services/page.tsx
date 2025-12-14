'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Video, Home, Zap } from 'lucide-react';

export default function DesignServicesPage() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: '',
    preferred_date: '',
    preferred_time: '',
    budget_range: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const services = [
    {
      id: 'virtual',
      icon: Video,
      title: 'Free Virtual Consultation',
      duration: '30 min',
      price: 'Free',
      description: 'Connect with our design team online. Get expert advice on furniture selection and space planning.',
    },
    {
      id: 'inhome',
      icon: Home,
      title: 'In-Home Consultation',
      duration: 'Full visit',
      price: '₹5,000',
      description: 'Our designers visit your home, take measurements, and create a personalized furniture plan. Fee refunded with purchase over ₹100,000',
    },
    {
      id: 'fullroom',
      icon: Zap,
      title: 'Full Room Design',
      duration: 'Complete project',
      price: 'Starting ₹25,000',
      description: 'Complete room transformation. We handle everything from concept to installation. Includes 3D renders and furniture selection.',
    },
  ];

  const handleBooking = (serviceId: string) => {
    setSelectedService(serviceId);
    setFormData(prev => ({
      ...prev,
      service_type: serviceId,
    }));
    setShowBookingModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('design_services_bookings')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your design consultation request has been submitted. We will contact you soon!',
      });
      setShowBookingModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service_type: '',
        preferred_date: '',
        preferred_time: '',
        budget_range: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#2C2C2C] to-[#C47456] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-5xl font-serif font-bold mb-4">
              Interior Design Consultation
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Transform your space with expert guidance from our award-winning design team. From virtual consultations to complete room makeovers, we have the perfect solution for you.
            </p>
            <Button className="bg-white text-[#2C2C2C] hover:bg-gray-100 text-lg">
              Get Started
            </Button>
          </div>
          <div className="bg-gray-300 aspect-square rounded-lg overflow-hidden">
            <img
              src="https://images.pexels.com/photos/3862603/pexels-photo-3862603.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="Design consultation"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-serif font-bold text-center text-gray-900 mb-12">
          Our Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map(service => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-[#C47456]/10 p-4 rounded-full">
                    <Icon size={40} className="text-[#C47456]" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 text-center mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600 text-center mb-2">{service.duration}</p>
                <p className="text-lg font-bold text-[#C47456] text-center mb-4">
                  {service.price}
                </p>
                <p className="text-gray-600 text-center mb-6">
                  {service.description}
                </p>
                <Button
                  onClick={() => handleBooking(service.id)}
                  className="w-full bg-[#2C2C2C] hover:bg-[#C47456] text-white"
                >
                  Book {service.title === 'Free Virtual Consultation' ? 'Free Consultation' : 'Visit'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Process Section */}
      <div className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold text-center text-gray-900 mb-12">
            Our Process
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {[
              { num: '1', title: 'Initial Consultation' },
              { num: '2', title: 'Design Concept' },
              { num: '3', title: 'Selection & Ordering' },
              { num: '4', title: 'Delivery & Installation' },
              { num: '5', title: 'Final Styling' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4 flex-1">
                <div className="bg-[#C47456] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {step.num}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{step.title}</p>
                </div>
                {i < 4 && (
                  <div className="hidden md:block w-8 h-0.5 bg-[#C47456] flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-serif font-bold text-center text-gray-900 mb-12">
          Our Work
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="relative overflow-hidden rounded-lg aspect-video bg-gray-200 group cursor-pointer">
              <img
                src={`https://images.pexels.com/photos/${1350789 + i}/pexels-photo-${1350789 + i}.jpeg?auto=compress&cs=tinysrgb&w=1600`}
                alt={`Project ${i}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button className="bg-white text-[#2C2C2C] hover:bg-[#C47456] hover:text-white">
                  View Project
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#2C2C2C] text-white py-16 text-center">
        <h2 className="text-4xl font-serif font-bold mb-4">Ready to Transform Your Space?</h2>
        <p className="text-xl mb-8 text-white/80">
          Our design experts are ready to help you create the perfect home
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            onClick={() => handleBooking('virtual')}
            className="bg-white text-[#2C2C2C] hover:bg-gray-100"
          >
            Book Virtual Consultation
          </Button>
          <Button
            onClick={() => handleBooking('inhome')}
            variant="outline"
            className="border-white text-white hover:bg-white/20"
          >
            Schedule Home Visit
          </Button>
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Your Design Consultation</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="budget">Budget Range</Label>
              <Select value={formData.budget_range} onValueChange={(value) => handleSelectChange('budget_range', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-50000">₹0 - ₹50,000</SelectItem>
                  <SelectItem value="50000-100000">₹50,000 - ₹100,000</SelectItem>
                  <SelectItem value="100000-250000">₹100,000 - ₹250,000</SelectItem>
                  <SelectItem value="250000+">₹250,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preferred_date">Preferred Date</Label>
              <Input
                id="preferred_date"
                name="preferred_date"
                type="date"
                value={formData.preferred_date}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="message">Special Requests</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us about your design goals..."
                rows={4}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2C2C2C] hover:bg-[#C47456] text-white"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}