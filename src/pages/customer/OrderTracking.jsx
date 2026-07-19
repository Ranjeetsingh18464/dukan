import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/helpers';
import OrderTimeline from '../../components/common/OrderTimeline';
import Loading from '../../components/common/Loading';
import { FiArrowLeft } from 'react-icons/fi';

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

  if (loading) return <Loading fullScreen />;
  if (!order) return <div className="text-center py-16"><h2 className="text-2xl text-gray-500">Order not found</h2></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-4 text-sm font-medium">
        <FiArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold mb-2">Track Order</h1>
      <p className="text-gray-500 mb-6">Order: <span className="font-mono">{order.orderId}</span></p>

      <div className="card mb-6">
        <OrderTimeline currentStatus={order.status} />
      </div>

      <div className="card space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Placed on</span>
          <span>{formatDateTime(order.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Customer</span>
          <span>{order.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Payment</span>
          <span className="capitalize">{order.paymentMethod}</span>
        </div>
        <div className="border-t pt-3">
          <p className="text-sm text-gray-500 mb-2">Items</p>
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-1">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-3">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
