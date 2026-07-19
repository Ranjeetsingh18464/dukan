import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function useOrders(shopId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) { setLoading(false); return; }
    let unsubscribe;
    try {
      const q = query(collection(db, 'orders'), where('shopId', '==', shopId), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snap) => {
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }, (err) => {
        console.error('Orders onSnapshot error, trying fallback:', err);
        const q2 = query(collection(db, 'orders'), where('shopId', '==', shopId));
        unsubscribe = onSnapshot(q2, (snap) => {
          setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        });
      });
    } catch (err) {
      console.error('Orders query error:', err);
      setLoading(false);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, [shopId]);

  return { orders, loading };
}
