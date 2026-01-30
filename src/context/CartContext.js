import React, { createContext, useContext, useEffect, useState } from "react";
import { getCart as storageGetCart, saveCart as storageSaveCart } from "../storage/cartStorage";

const CartContext = createContext({
  cart: [],
  addItem: async () => {},
  removeItem: async () => {},
  setQuantity: async () => {},
  increaseQuantity: async () => {},
  decreaseQuantity: async () => {},
  getItemQuantity: () => 0,
  clearCart: async () => {},
  isInCart: () => false,
  count: 0,
});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    (async () => {
      const items = await storageGetCart();
      setCart(items);
    })();
  }, []);

  // Persist whenever cart changes
  useEffect(() => {
    (async () => {
      try {
        await storageSaveCart(cart);
      } catch (e) {
        // ignore
      }
    })();
  }, [cart]);

  const addItem = async (product) => {
    setCart((prev) => {
      const found = prev.find((p) => p.id === product.id);
      if (found) {
        // increase quantity
        return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    return true;
  };

  const removeItem = async (productId) => {
    setCart((prev) => prev.filter((p) => p.id !== productId));
  };

  const setQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }
    setCart((prev) => prev.map((p) => (p.id === productId ? { ...p, quantity } : p)));
  };

  const increaseQuantity = async (productId) => {
    setCart((prev) => prev.map((p) => (p.id === productId ? { ...p, quantity: p.quantity + 1 } : p)));
  };

  const decreaseQuantity = async (productId) => {
    setCart((prev) => {
      return prev.map((p) => {
        if (p.id === productId) {
          const newQuantity = p.quantity - 1;
          return newQuantity > 0 ? { ...p, quantity: newQuantity } : null;
        }
        return p;
      }).filter(Boolean);
    });
  };

  const getItemQuantity = (productId) => {
    const item = cart.find((p) => p.id === productId);
    return item ? item.quantity : 0;
  };

  const clearCart = async () => {
    setCart([]);
  };

  const isInCart = (productId) => cart.some((p) => p.id === productId);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addItem, 
      removeItem, 
      setQuantity, 
      increaseQuantity,
      decreaseQuantity,
      getItemQuantity,
      clearCart, 
      isInCart, 
      count: cart.reduce((s, p) => s + (p.quantity || 0), 0) 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
