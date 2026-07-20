import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/helpers';
import OrderTimeline from '../../components/common/OrderTimeline';
import Loading from '../../components/common/Loading';
import { FiArrowLeft, FiCopy, FiCheckCircle, FiPackage, FiCreditCard, FiCalendar, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'orders', id), (snap) => {
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [id]);

  function copyOrderId() {
    if (order?.orderId) {
      navigator.clipboard.writeText(order.orderId);
      toast.success('Order ID copied');
    }
  }

  if (loading) return <Loading fullScreen />;
  if (!order) return (
    <div className="text-center py-20 animate-fade-in">
      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <FiPackage className="w-10 h-10 text-gray-300" />
      </div>
      <h2 className="text-2xl font-bold text-gray-500">Order not found</h2>
      <p className="text-gray-400 mt-2 text-sm">This order may have been deleted.</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-4 text-sm font-medium transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center justify-between mb-6 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold">Track Order</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500 font-mono text-sm">{order.orderId}</p>
            <button onClick={copyOrderId} className="p-1 hover:bg-gray-100 rounded-lg transition-colors" title="Copy Order ID">
              <FiCopy className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>
        <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${
          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
          order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
          order.status === 'processing' ? 'bg-indigo-100 text-indigo-700' :
          order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
        </span>
      </div>

      <div className="card mb-6 animate-slide-up animate-slide-up-delay-1">
        <OrderTimeline currentStatus={order.status} />
      </div>

      <div className="card animate-slide-up animate-slide-up-delay-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <FiCalendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Placed on</p>
              <p className="text-sm font-medium">{formatDateTime(order.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <FiUser className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Customer</p>
              <p className="text-sm font-medium">{order.customerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <FiCreditCard className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Payment</p>
              <p className="text-sm font-medium capitalize">{order.paymentMethod}</p>
            </div>
          </div>
          {order.customerPhone && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <FiCheckCircle className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="text-sm font-medium">{order.customerPhone}</p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-500 mb-3">Items</p>
          <div className="space-y-2">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                {item.images?.[0] && <img src={item.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-bold shrink-0">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-indigo-600">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {order.notes && (
          <div className="border-t border-gray-100 pt-4 mt-4">
            <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
