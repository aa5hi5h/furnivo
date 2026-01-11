'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { 
  Smartphone, 
  CheckCircle, 
  Phone, 
  MapPin, 
  Plus,
  Edit,
  Loader2
} from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  color?: string;
  product?: {
    name: string;
    price: number;
    image: string;
    stock: number;
  };
}

export default function CheckoutPage() {
  const { items } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  
  // New address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const shipping = subtotal > 50000 ? 0 : 500;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  // Load addresses
  useEffect(() => {
    if (status === 'authenticated') {
      loadAddresses();
    }
  }, [status]);

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const response = await fetch('/api/account/address');
      const result = await response.json();

      if (result.success) {
        setAddresses(result.data || []);
        // Auto-select default address
        const defaultAddr = result.data.find((addr: Address) => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr.id);
        } else if (result.data.length > 0) {
          setSelectedAddress(result.data[0].id);
        }
      } else {
        // Handle array response (your current API format)
        if (Array.isArray(result)) {
          setAddresses(result);
          const defaultAddr = result.find((addr: Address) => addr.isDefault);
          if (defaultAddr) {
            setSelectedAddress(defaultAddr.id);
          } else if (result.length > 0) {
            setSelectedAddress(result[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load addresses',
        variant: 'error',
      });
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSaveAddress = async () => {
    // Validation
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'error',
      });
      return;
    }

    setSavingAddress(true);

    try {
      const response = await fetch('/api/account/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Address Saved',
          description: 'Your address has been saved successfully',
        });
        
        // Reload addresses and select the new one
        await loadAddresses();
        setSelectedAddress(result.id);
        setShowAddressForm(false);
        
        // Reset form
        setNewAddress({
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'India',
          isDefault: false,
        });
      } else {
        throw new Error(result.error || 'Failed to save address');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save address',
        variant: 'error',
      });
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePayment = async () => {
    // Validation
    if (!selectedAddress) {
      toast({
        title: 'Select Address',
        description: 'Please select a shipping address',
        variant: 'error',
      });
      return;
    }

    if (!mobileNumber || mobileNumber.length !== 10) {
      toast({
        title: 'Mobile Number Required',
        description: 'Please enter a valid 10-digit mobile number',
        variant: 'error',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Your cart is empty',
        variant: 'error',
      });
      return;
    }

    setProcessingPayment(true);

    try {
      // Initiate PhonePe payment
      const response = await fetch('/api/payment/phonepe/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          addressId: selectedAddress,
          mobileNumber: mobileNumber,
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.redirectUrl) {
        // Show loading message
        toast({
          title: 'Redirecting to Payment',
          description: 'Please wait while we redirect you to PhonePe...',
        });

        // Small delay for better UX
        setTimeout(() => {
          // Redirect to PhonePe payment page
          window.location.href = result.data.redirectUrl;
        }, 1000);
      } else {
        throw new Error(result.error || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Something went wrong',
        variant: 'error',
      });
      setProcessingPayment(false);
    }
  };

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#C47456]" />
      </div>
    );
  }

  if (!session) {
    router.push('/auth');
    return null;
  }

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Shipping Address Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h2>
                <Dialog open={showAddressForm} onOpenChange={setShowAddressForm}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Street Address *</Label>
                        <Input
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                          placeholder="123 Main Street, Apartment 4B"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>City *</Label>
                          <Input
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            placeholder="Mumbai"
                          />
                        </div>
                        <div>
                          <Label>State *</Label>
                          <Input
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            placeholder="Maharashtra"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Postal Code *</Label>
                          <Input
                            value={newAddress.postalCode}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 6) {
                                setNewAddress({ ...newAddress, postalCode: value });
                              }
                            }}
                            placeholder="400001"
                            maxLength={6}
                          />
                        </div>
                        <div>
                          <Label>Country</Label>
                          <Input
                            value={newAddress.country}
                            onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                            placeholder="India"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="default"
                          checked={newAddress.isDefault}
                          onCheckedChange={(checked) =>
                            setNewAddress({ ...newAddress, isDefault: checked as boolean })
                          }
                        />
                        <Label htmlFor="default" className="cursor-pointer">
                          Set as default address
                        </Label>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowAddressForm(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveAddress}
                          disabled={savingAddress}
                          className="flex-1 bg-[#C47456] hover:bg-[#B36647]"
                        >
                          {savingAddress ? 'Saving...' : 'Save Address'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {loadingAddresses ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#C47456]" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No addresses found</p>
                  <Button onClick={() => setShowAddressForm(true)}>
                    Add Your First Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAddress === address.id
                          ? 'border-[#C47456] bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddress === address.id}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {address.street}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm text-gray-600">{address.country}</p>
                          {address.isDefault && (
                            <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        {selectedAddress === address.id && (
                          <CheckCircle className="w-5 h-5 text-[#C47456] flex-shrink-0" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Information Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Mobile Number for Payment *
                  </Label>
                  <Input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setMobileNumber(value);
                      }
                    }}
                    className="mt-1"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This number will be used for payment verification and order updates
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    type="email"
                    value={session.user?.email || ''}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Order confirmation will be sent to this email
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
           
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                      {item.product?.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name || ''}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      {item.color && (
                        <p className="text-xs text-gray-500">Color: {item.color}</p>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${shipping.toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (GST 18%)</span>
                  <span className="font-medium">
                    ₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                {subtotal < 50000 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    Add ₹{(50000 - subtotal).toLocaleString('en-IN')} more for free shipping!
                  </div>
                )}

                <Separator className="my-3" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-[#C47456]">
                    ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <Button
                className="w-full mt-6 bg-[#C47456] hover:bg-[#B36647] text-white py-6 text-lg font-semibold"
                onClick={handlePayment}
                disabled={processingPayment || !selectedAddress || !mobileNumber}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Redirecting 
                  </>
                ) : (
                  'Pay'
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                🔒 Secure payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}