'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getSharedSupabaseClient } from '@/hooks/useSupabaseClient';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  alt: string;
  price: number;
  quantity: number;
  weight: string;
  origin: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const supabase = getSharedSupabaseClient();

  // Load cart data (from localStorage for guests, from database for authenticated users)
  useEffect(() => {
    let isMounted = true;

    const loadCart = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      try {
        if (user) {
          // Load from database for authenticated users
          const { data, error } = await supabase
            .from('cart_items')
            .select(`
              id,
              product_id,
              quantity,
              weight,
              products (name, price, image_url, category)
            `)
            .eq('user_id', user.id);

          // Check for AbortError in both message and details
          if (error) {
            const isAbortError = 
              error?.message?.includes('AbortError') ||
              error?.details?.includes('AbortError');
            
            if (isAbortError) {
              // Silently ignore abort errors - expected during auth init
              return;
            }
            
            throw error;
          }

          if (!isMounted) return;

          const formattedItems = (data || []).map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            name: item.products?.name || '',
            image: item.products?.image_url || '',
            alt: item.products?.name || '',
            price: parseFloat(item.products?.price || 0),
            quantity: item.quantity,
            weight: item.weight || '1 unit',
            origin: item.products?.category || '',
          }));

          setCartItems(formattedItems);
        } else {
          // Load from localStorage for guest users
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            try {
              if (isMounted) {
                setCartItems(JSON.parse(savedCart));
              }
            } catch (error) {
              console.error('Error parsing cart from storage:', error);
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading cart:', error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsHydrated(true);
        }
      }
    };

    if (!authLoading) {
      loadCart();
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  // Save cart to localStorage for guests (already synced to DB for authenticated users via addToCart)
  useEffect(() => {
    if (isHydrated && !user) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isHydrated, user]);

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    try {
      if (user) {
        // Get product_id from products table using name
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('id')
          .eq('name', item.name)
          .single();

        if (productError) throw productError;

        const productId = productData?.id;
        if (!productId) {
          console.error('Product not found');
          return;
        }

        // Try to update existing cart item
        let existingItem: any = null;
        const { data: existingItemData, error: checkError } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .eq('weight', item.weight || '1 unit')
          .single();

        if (!checkError && existingItemData) {
          existingItem = existingItemData;
        }

        if (existingItem) {
          // Update quantity
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + item.quantity })
            .eq('id', existingItem.id);

          if (updateError) throw updateError;
        } else {
          // Insert new cart item
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert([
              {
                user_id: user.id,
                product_id: productId,
                quantity: item.quantity,
                weight: item.weight || '1 unit',
              },
            ]);

          if (insertError) throw insertError;
        }

        // Reload cart
        const { data: cartData, error } = await supabase
          .from('cart_items')
          .select(`
            id,
            product_id,
            quantity,
            weight,
            products (name, price, image_url, category)
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        const formattedItems = (cartData || []).map((row: any) => ({
          id: row.id,
          productId: row.product_id,
          name: row.products?.name || '',
          image: row.products?.image_url || '',
          alt: row.products?.name || '',
          price: parseFloat(row.products?.price || 0),
          quantity: row.quantity,
          weight: row.weight || '1 unit',
          origin: row.products?.category || '',
        }));

        setCartItems(formattedItems);
      } else {
        // Add to localStorage for guests
        setCartItems((prevItems) => {
          const existingItemIndex = prevItems.findIndex(
            (cartItem) =>
              cartItem.productId === item.productId && cartItem.weight === item.weight
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...prevItems];
            updatedItems[existingItemIndex].quantity += item.quantity;
            return updatedItems;
          } else {
            const newItem: CartItem = {
              ...item,
              id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            };
            return [...prevItems, newItem];
          }
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
      } else {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', id);

        if (error) throw error;
      }

      setCartItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    try {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
      }

      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isLoading,
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