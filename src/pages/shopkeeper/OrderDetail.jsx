import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, query, where, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatDate } from '../../utils/helpers';
import Loading from '../../components/common/Loading';
import InvoicePrint from '../../components/common/InvoicePrint';
import { FiArrowLeft, FiPhone, FiMessageCircle } from 'react-icons/fi';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderNo, setOrderNo] = useState('');

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'orders', id));
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setOrder(data);
        const shopSnap = await getDoc(doc(db, 'shops', data.shopId));
        if (shopSnap.exists()) setShop({ id: shopSnap.id, ...shopSnap.data() });
        const typeFilter = data.type === 'purchase' ? 'purchase' : 'invoice';
        const allSnap = await getDocs(query(collection(db, 'orders'), where('shopId', '==', data.shopId), where('type', '==', typeFilter)));
        const sorted = allSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        const idx = sorted.findIndex(o => o.id === id) + 1;
        setOrderNo(typeFilter === 'purchase' ? `Order No ${idx}` : `Invoice No ${idx}`);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <Loading />;
  if (!order) return <p>Order not found</p>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/orders" className="p-2 hover:bg-gray-100 rounded-lg"><FiArrowLeft /></Link>
          <div>
            <h1 className="text-2xl font-bold">{orderNo}</h1>
            <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>
        <InvoicePrint order={order} shop={shop} orderNo={orderNo} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {order.type !== 'purchase' && <p className="text-sm text-gray-500">Qty: {item.quantity} × {item.price}</p>}
                  </div>
                  {order.type !== 'purchase' ? <p className="font-medium">{item.price * item.quantity}</p> : <p className="font-medium">{item.quantity}</p>}
                </div>
              ))}
            </div>
            {order.type !== 'purchase' && (
              <div className="flex justify-between mt-4 pt-4 border-t font-bold text-lg">
                <span>Total</span>
                <span>{order.total}</span>
              </div>
            )}
          </div>
          <div className="card">
            <h3 className="font-semibold mb-4">{order.type === 'purchase' ? 'Vendor Info' : 'Customer Info'}</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {order.type === 'purchase' ? order.vendorName : order.customerName}</p>
              <p><strong>Phone:</strong> {order.type === 'purchase' ? order.vendorPhone : order.customerPhone}</p>
              {(order.type === 'purchase' ? order.vendorEmail : order.customerEmail) && (
                <p><strong>Email:</strong> {order.type === 'purchase' ? order.vendorEmail : order.customerEmail}</p>
              )}
              {order.address && <p><strong>Address:</strong> {order.address}</p>}
              <p><strong>Payment:</strong> {order.paymentMethod}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <a href={`tel:${order.type === 'purchase' ? order.vendorPhone : order.customerPhone}`} className="btn-secondary flex items-center gap-2 text-sm"><FiPhone /> Call</a>
              <a href={`https://wa.me/91${order.type === 'purchase' ? order.vendorPhone : order.customerPhone}`} target="_blank" rel="noopener" className="btn-secondary flex items-center gap-2 text-sm"><FiMessageCircle /> WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="space-y-6">
        </div>
      </div>
    </div>
  );
}
