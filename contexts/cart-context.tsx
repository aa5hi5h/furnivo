'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
  };
  quantity: number;
  selected_color: string;
  created_at: string;
  updated_at: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (productId: string, quantity: number, color?: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  user: { id: string; email?: string; [key: string]: any } | null;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadCart(user.id);
    } else {
      setCart([]);
    }
  }, [user?.id]);

  const loadCart = async (userId: string) => {
    try {
      const response = await fetch(`/api/cart?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1, color?: string) => {
    if (!user?.id) {
      alert('Please sign in to add items to cart');
      return;
    }

    const existingItem = cart.find(
      item => item.product_id === productId && item.selected_color === (color || '')
    );

    if (existingItem) {
      await updateQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            productId,
            quantity,
            selectedColor: color || '',
          }),
        });

        if (response.ok) {
          await loadCart(user.id);
          setIsCartOpen(true);
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadCart(user.id);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user?.id) return;

    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        await loadCart(user.id);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/cart/clear?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCart([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        user,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
