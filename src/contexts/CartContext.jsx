import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  function addItem(product, quantity = 1, shopId) {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...product, quantity, shopId }];
    });
  }

  function removeItem(productId) {
    setItems(prev => prev.filter(i => i.id !== productId));
  }

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) return removeItem(productId);
    setItems(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i));
  }

  function clearCart() {
    setItems([]);
  }

  function getCartTotal() {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  function getItemCount() {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  const value = { items, addItem, removeItem, updateQuantity, clearCart, getCartTotal, getItemCount };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
