'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

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

interface CartContextType {
  items: CartItem[];
  addToCart: (productId: string, quantity: number, color?: string) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cart when user logs in
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      loadCart();
    } else if (status === 'unauthenticated') {
      setItems([]);
    }
  }, [status, session?.user?.id]);

  const loadCart = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/cart?userId=${session.user.id}`);
      const result = await response.json();

      if (result.success) {
        setItems(result.data || []);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const addToCart = async (productId: string, quantity: number, color?: string) => {
    // Check if user is authenticated
    if (status !== 'authenticated' || !session?.user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add items to cart',
        variant: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          productId,
          quantity,
          color,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await loadCart(); // Reload cart to get updated data
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to add item to cart',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setItems(prev => prev.filter(item => item.id !== cartItemId));
      } else {
        toast({
          title: 'Error',
          description: 'Failed to remove item',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      const result = await response.json();

      if (result.success) {
        setItems(prev =>
          prev.map(item =>
            item.id === cartItemId ? { ...item, quantity } : item
          )
        );
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update quantity',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quantity',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      await Promise.all(
        items.map(item => 
          fetch(`/api/cart/${item.id}`, { method: 'DELETE' })
        )
      );
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear cart',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loading,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}