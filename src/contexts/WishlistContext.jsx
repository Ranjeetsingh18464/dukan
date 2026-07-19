import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wishlist')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items));
  }, [items]);

  function toggleWishlist(product) {
    setItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.filter(i => i.id !== product.id);
      return [...prev, product];
    });
  }

  function isInWishlist(productId) {
    return items.some(i => i.id === productId);
  }

  function removeItem(productId) {
    setItems(prev => prev.filter(i => i.id !== productId));
  }

  const value = { items, toggleWishlist, isInWishlist, removeItem };
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
