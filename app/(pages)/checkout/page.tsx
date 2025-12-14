'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, user, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const shippingCost = deliveryOption === 'express' ? 2000 : 0;
  const total = cartTotal + shippingCost;

  const handlePlaceOrder = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    setLoading(true);

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: total,
        shipping_address: shippingInfo,
        payment_method: paymentMethod,
        delivery_option: deliveryOption,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (!error && order) {
      const orderItems = cart.map((item:any) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price,
        selected_color: item.selected_color,
      }));

      await supabase.from('order_items').insert(orderItems);
      await clearCart();
      setStep(4);
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to checkout</h2>
          <Button onClick={() => router.push('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && step !== 4) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => router.push('/products')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="font-serif text-4xl font-bold text-[#2C2C2C] mb-8">Checkout</h1>

        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-[#2C2C2C] text-white' : 'bg-gray-300'}`}>
              1
            </div>
            <div className={`w-24 h-1 ${step >= 2 ? 'bg-[#2C2C2C]' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-[#2C2C2C] text-white' : 'bg-gray-300'}`}>
              2
            </div>
            <div className={`w-24 h-1 ${step >= 3 ? 'bg-[#2C2C2C]' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-[#2C2C2C] text-white' : 'bg-gray-300'}`}>
              3
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Full Name</Label>
                      <Input
                        value={shippingInfo.fullName}
                        onChange={(e:any) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e:any) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e:any) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Address</Label>
                      <Input
                        value={shippingInfo.address}
                        onChange={(e:any) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input
                        value={shippingInfo.city}
                        onChange={(e:any) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input
                        value={shippingInfo.state}
                        onChange={(e:any) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Pincode</Label>
                      <Input
                        value={shippingInfo.pincode}
                        onChange={(e:any) => setShippingInfo({ ...shippingInfo, pincode: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-[#2C2C2C]" onClick={() => setStep(2)}>
                    Continue to Delivery
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Delivery Options</h2>
                  <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption}>
                    <div className="flex items-center space-x-3 border rounded-lg p-4 mb-3">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Standard Delivery (FREE)</div>
                        <div className="text-sm text-gray-600">2-4 weeks</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-lg p-4">
                      <RadioGroupItem value="express" id="express" />
                      <Label htmlFor="express" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Express Delivery (₹2,000)</div>
                        <div className="text-sm text-gray-600">1-2 weeks</div>
                      </Label>
                    </div>
                  </RadioGroup>
                  <div className="flex gap-4 mt-6">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button className="flex-1 bg-[#2C2C2C]" onClick={() => setStep(3)}>
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-3 border rounded-lg p-4 mb-3">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Credit/Debit Card</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-lg p-4 mb-3">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex-1 cursor-pointer">
                        <div className="font-semibold">UPI</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-lg p-4">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Cash on Delivery</div>
                      </Label>
                    </div>
                  </RadioGroup>
                  <div className="flex gap-4 mt-6">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-[#2C2C2C]"
                      onClick={handlePlaceOrder}
                      disabled={loading}
                    >
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold mb-4">Order Placed Successfully!</h2>
                  <p className="text-gray-600 mb-8">
                    Thank you for your purchase. We'll send you an email confirmation shortly.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => router.push('/account')}>
                      View Orders
                    </Button>
                    <Button onClick={() => router.push('/products')} className="bg-[#2C2C2C]">
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images[0] && (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost.toLocaleString()}`}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
