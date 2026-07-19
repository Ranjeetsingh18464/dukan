import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function useCategories(shopId) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) { setLoading(false); return; }
    let cancelled = false;
    async function fetchCategories() {
      try {
        const q = query(collection(db, 'categories'), where('shopId', '==', shopId), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!cancelled) setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching categories:', err);
        try {
          const q = query(collection(db, 'categories'), where('shopId', '==', shopId));
          const snap = await getDocs(q);
          if (!cancelled) setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err2) {
          console.error('Fallback categories fetch also failed:', err2);
        }
      }
      if (!cancelled) setLoading(false);
    }
    fetchCategories();
    return () => { cancelled = true; };
  }, [shopId]);

  return { categories, loading };
}
