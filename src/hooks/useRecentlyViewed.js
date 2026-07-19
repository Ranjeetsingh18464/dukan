import { useState, useEffect } from 'react';

const KEY = 'recentlyViewed';
const MAX = 10;

export default function useRecentlyViewed() {
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(recent));
  }, [recent]);

  function addProduct(product) {
    setRecent(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, MAX);
    });
  }

  return { recent, addProduct };
}
