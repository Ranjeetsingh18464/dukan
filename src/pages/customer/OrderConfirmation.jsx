import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatCurrency, formatDate } from '../../utils/helpers';
import QRCodeGenerator from '../../components/common/QRCodeGenerator';
import Loading from '../../components/common/Loading';
import { FiCheckCircle, FiMapPin } from 'react-icons/fi';

export default function OrderConfirmation() {
  const { id, slug } = useParams();
  const [order, setOrder] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'orders', id));
      if (snap.exists()) {
        const orderData = { id: snap.id, ...snap.data() };
        setOrder(orderData);
        const shopSnap = await getDoc(doc(db, 'shops', orderData.shopId));
        if (shopSnap.exists()) setShop({ id: shopSnap.id, ...shopSnap.data() });
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <Loading fullScreen />;
  if (!order) return <div className="text-center py-16"><h2 className="text-2xl text-gray-500">Order not found</h2></div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <FiCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
      <p className="text-gray-500 mb-6">Thank you for your order</p>

      <div className="card text-left space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Order ID</span>
          <span className="font-mono font-bold">{order.orderId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Date</span>
          <span>{formatDate(order.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Payment</span>
          <span className="capitalize">{order.paymentMethod}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-3">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      {shop && (
        <div className="flex justify-center mt-6">
          <QRCodeGenerator value={`${window.location.origin}/shop/${shop.slug}`} size={120} title={shop.name} />
        </div>
      )}

      <div className="flex gap-3 justify-center flex-wrap mt-8">
        <Link to={`/track/${id}`} className="btn-primary flex items-center gap-2">Track Order</Link>
        {shop && <Link to={`/shop/${shop.slug}`} className="btn-secondary">Continue Shopping</Link>}
        {order.customerId && <Link to={`/shop/${slug}/my-orders`} className="btn-secondary">My Orders</Link>}
      </div>
    </div>
  );
}
