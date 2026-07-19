import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Empty from '../../components/common/Empty';
import { FiShoppingBag, FiTrash2, FiPackage, FiArrowRight } from 'react-icons/fi';
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
      <div className="flex items-center justify-between mb-6 animate-slide-up">
        <h1 className="text-2xl font-bold">My Orders</h1>
        {orders.length > 0 && (
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{orders.length} order(s)</span>
        )}
      </div>
      {orders.length === 0 && !loading ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiPackage className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-500 mb-2">No orders yet</h2>
          <p className="text-gray-400 text-sm mb-6">Start shopping to see your orders here</p>
          <Link to="/customer/shops" className="btn-primary inline-flex items-center gap-2">
            <FiShoppingBag className="w-4 h-4" /> Browse Shops
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <div key={order.id} className="card hover:shadow-md hover:border-indigo-200 transition-all animate-slide-up" style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm">{order.orderId}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-3 line-clamp-1">
                {order.items?.length} item(s) — {order.items?.map(i => i.name).join(', ')}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 capitalize bg-gray-50 px-2.5 py-1 rounded-lg">{order.paymentMethod}</span>
                  <Link to={`/track/${order.id}`} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors">
                    Track <FiArrowRight className="w-3 h-3" />
                  </Link>
                  <button onClick={() => deleteOrder(order.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete order">
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
