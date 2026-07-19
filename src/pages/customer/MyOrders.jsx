import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Empty from '../../components/common/Empty';
import { FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function MyOrders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    const q = query(collection(db, 'orders'), where('customerId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user?.uid]);

  async function deleteOrder(id) {
    if (!confirm('Delete this order?')) return;
    await deleteDoc(doc(db, 'orders', id));
    toast.success('Order deleted');
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 && !loading ? (
        <Empty message="No orders yet" icon={FiShoppingBag} />
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-mono font-bold text-sm">{order.orderId}</span>
                  <span className="text-gray-400 mx-2">|</span>
                  <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                  {order.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {order.items?.length} item(s) - {order.items?.map(i => i.name).join(', ')}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">{formatCurrency(order.total)}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 capitalize">{order.paymentMethod}</span>
                  <button onClick={() => deleteOrder(order.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete order">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
