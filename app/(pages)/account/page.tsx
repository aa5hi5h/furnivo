'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {Package,Heart,MapPin,Settings,LogOut,Trash2,Plus,Edit,CheckCircle,Clock,Truck,XCircle,Loader2,Eye,EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmationModal from '@/components/confirmation-modal';
import GeoapifyAutocomplete from '@/components/geo-auto-complete';

// Interfaces
interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice: number | null;
  category: string;
  rating: number;
  reviewCount: number;
}

interface WishlistItem {
  id: string;
  product: Product;
  createdAt: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  orderItems: OrderItem[];
  address?: Address;
}

interface Profile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
}

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger',
  });
  
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [phoneError, setPhoneError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      loadUserData(session.user.id);
    }
  }, [status, session]);

  const loadUserData = async (userId: string) => {
    try {
      setLoading(true);
      
      const [profileRes, ordersRes, wishlistRes, addressesRes] = await Promise.all([
        fetch('/api/account/profile'),
        fetch('/api/orders'),
        fetch(`/api/wishlist?userId=${userId}`),
        fetch('/api/account/address')
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.success ? ordersData.data : ordersData);
      }

      if (wishlistRes.ok) {
        const wishlistData = await wishlistRes.json();
        setWishlist(wishlistData.success ? wishlistData.data : []);
      }

      if (addressesRes.ok) {
        const addressesData = await addressesRes.json();
        setAddresses(addressesData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) {
      setPhoneError('');
      return true;
    }

    // Remove any spaces, dashes, or other non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return false;
    }

    if (!/^\d{10}$/.test(cleanPhone)) {
      setPhoneError('Phone number must contain only digits');
      return false;
    }

    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedValue = numericValue.slice(0, 10);
    
    setProfile(prev => prev ? { ...prev, phone: limitedValue } : null);
    validatePhone(limitedValue);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    // Validate phone before saving
    if (profile.phone && !validatePhone(profile.phone)) {
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      });

      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        toast.success('Profile updated successfully');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const validatePassword = (): boolean => {
    let isValid = true;
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
      isValid = false;
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
      isValid = false;
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
      isValid = false;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/account/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Password changed successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowPasswordForm(false);
        setPasswordErrors({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(data.error || 'Failed to change password');
        if (data.error?.includes('current password')) {
          setPasswordErrors(prev => ({
            ...prev,
            currentPassword: 'Current password is incorrect',
          }));
        }
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFromWishlist = async (wishlistItemId: string) => {
    try {
      const res = await fetch(`/api/wishlist/${wishlistItemId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setWishlist(prev => prev.filter(item => item.id !== wishlistItemId));
        toast.success('Item removed from wishlist');
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const method = editingAddress ? 'PUT' : 'POST';
      const url = editingAddress 
        ? `/api/account/address/${editingAddress.id}` 
        : '/api/account/address';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });

      if (res.ok) {
        const savedAddress = await res.json();
        
        if (editingAddress) {
          // Update the address in the list
          setAddresses(prev => prev.map(addr => 
            addr.id === savedAddress.id ? savedAddress : (savedAddress.isDefault ? { ...addr, isDefault: false } : addr)
          ));
          toast.success('Address updated successfully');
        } else {
          // Add new address and unset default on others if this is default
          if (savedAddress.isDefault) {
            setAddresses(prev => [...prev.map(addr => ({ ...addr, isDefault: false })), savedAddress]);
          } else {
            setAddresses(prev => [...prev, savedAddress]);
          }
          toast.success('Address added successfully');
        }
        
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressForm({
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'India',
          isDefault: false,
        });
      } else {
        throw new Error('Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Address',
      message: 'Are you sure you want to delete this address? This action cannot be undone.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/account/address/${addressId}`, {
            method: 'DELETE',
          });

          if (res.ok) {
            setAddresses(prev => prev.filter(addr => addr.id !== addressId));
            toast.success('Address deleted successfully');
          } else {
            throw new Error('Failed to delete address');
          }
        } catch (error) {
          console.error('Error deleting address:', error);
          toast.error('Failed to delete address');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const res = await fetch(`/api/account/address/${addressId}/default`, {
        method: 'PUT',
      });

      if (res.ok) {
        // Immediately update the UI
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId,
        })));
        toast.success('Default address updated');
      } else {
        throw new Error('Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set default address');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#C47456]" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-4xl font-bold text-[#2C2C2C] mb-2">My Account</h1>
            <p className="text-gray-600">{session.user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4 mb-8">
            <TabsTrigger value="orders">
              <Package className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="wishlist">
              <Heart className="w-4 h-4 mr-2" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin className="w-4 h-4 mr-2" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* ORDERS TAB */}
          <TabsContent value="orders">
            <div className="space-y-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No orders yet</p>
                    <Button onClick={() => router.push('/products')}>Start Shopping</Button>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        {order.orderItems.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                              {item.product.image && (
                                <Image
                                  src={item.product.image}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.product.name}</p>
                              <p className="text-xs text-gray-600">Qty: {item.quantity} × ₹{item.price}</p>
                            </div>
                          </div>
                        ))}
                        {order.orderItems.length > 2 && (
                          <p className="text-sm text-gray-600">+ {order.orderItems.length - 2} more items</p>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold">₹{order.totalAmount.toLocaleString()}</p>
                        </div>
                        <Button variant="outline" onClick={() => router.push(`/orders/${order.id}`)}>
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* WISHLIST TAB */}
          <TabsContent value="wishlist">
            <div className="space-y-4">
              {wishlist.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Your wishlist is empty</p>
                    <Button onClick={() => router.push('/products')}>Browse Products</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {item.product.image && (
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-sm mb-1">{item.product.name}</h3>
                            <p className="text-lg font-bold text-[#C47456]">₹{item.product.price.toLocaleString()}</p>
                            {item.product.originalPrice && (
                              <p className="text-sm text-gray-500 line-through">
                                ₹{item.product.originalPrice.toLocaleString()}
                              </p>
                            )}
                            <div className="flex gap-2 mt-3">
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => router.push(`/products/${item.product.slug}`)}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveFromWishlist(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ADDRESSES TAB */}
          <TabsContent value="addresses">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Saved Addresses</h2>
                <Button onClick={() => {
                  setEditingAddress(null);
                  setAddressForm({
                    street: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'India',
                    isDefault: false,
                  });
                  setShowAddressForm(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Address
                </Button>
              </div>

              {showAddressForm && (
  <Card>
    <CardHeader>
      <CardTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</CardTitle>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleSaveAddress} className="space-y-4">
        {/* NEW: Address Autocomplete */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Search Address
          </label>
          <GeoapifyAutocomplete
            defaultValue={addressForm.street}
            onAddressSelect={(address) => {
              setAddressForm({
                ...addressForm,
                street: address.street,
                city: address.city,
                state: address.state,
                postalCode: address.postalCode,
                country: address.country,
              });
            }}
            placeholder="Start typing your address..."
          />
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or enter manually</span>
          </div>
        </div>

        {/* Manual Entry Fields */}
        <div>
          <label className="block text-sm font-medium mb-2">Street Address</label>
          <input
            type="text"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C47456]"
            value={addressForm.street}
            onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C47456]"
              value={addressForm.city}
              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">State</label>
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C47456]"
              value={addressForm.state}
              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Postal Code</label>
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C47456]"
              value={addressForm.postalCode}
              onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Country</label>
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C47456]"
              value={addressForm.country}
              onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDefault"
            className="mr-2"
            checked={addressForm.isDefault}
            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
          />
          <label htmlFor="isDefault" className="text-sm">Set as default address</label>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Address'}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => {
              setShowAddressForm(false);
              setEditingAddress(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
)}

              {addresses.length === 0 && !showAddressForm ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No saved addresses</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <Card key={address.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-medium">{address.street}</p>
                            <p className="text-gray-600">
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                            <p className="text-gray-600">{address.country}</p>
                          </div>
                          {address.isDefault && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditAddress(address)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          {!address.isDefault && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSetDefaultAddress(address.id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-4 py-2"
                        value={profile?.name || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full border rounded-lg px-4 py-2 bg-gray-50"
                        value={profile?.email || ''}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        className={`w-full border rounded-lg px-4 py-2 ${phoneError ? 'border-red-500' : ''}`}
                        value={profile?.phone || ''}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="Enter 10-digit phone number"
                        maxLength={10}
                      />
                      {phoneError && (
                        <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">Enter exactly 10 digits</p>
                    </div>
                    <Button 
                      className="bg-[#2C2C2C]"
                      onClick={handleSaveProfile}
                      disabled={saving || !!phoneError}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Change Password Section */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Change Password</CardTitle>
                    {!showPasswordForm && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowPasswordForm(true)}
                      >
                        Change Password
                      </Button>
                    )}
                  </div>
                </CardHeader>
                {showPasswordForm && (
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            className={`w-full border rounded-lg px-4 py-2 pr-10 ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                            value={passwordForm.currentPassword}
                            onChange={(e) => {
                              setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                              setPasswordErrors({ ...passwordErrors, currentPassword: '' });
                            }}
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {passwordErrors.currentPassword && (
                          <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            className={`w-full border rounded-lg px-4 py-2 pr-10 ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                            value={passwordForm.newPassword}
                            onChange={(e) => {
                              setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                              setPasswordErrors({ ...passwordErrors, newPassword: '' });
                            }}
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {passwordErrors.newPassword && (
                          <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">Must be at least 8 characters long</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            className={`w-full border rounded-lg px-4 py-2 pr-10 ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => {
                              setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                              setPasswordErrors({ ...passwordErrors, confirmPassword: '' });
                            }}
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {passwordErrors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Button type="submit" disabled={saving} className="bg-[#2C2C2C]">
                          {saving ? 'Changing...' : 'Change Password'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordForm({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: '',
                            });
                            setPasswordErrors({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: '',
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
      />
    </div>
  );
}