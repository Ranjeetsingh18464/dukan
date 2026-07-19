import { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatCurrency, generateOrderId } from '../../utils/helpers';
import { PAYMENT_METHODS } from '../../utils/constants';
import toast from 'react-hot-toast';
import { FiCreditCard, FiMapPin, FiPackage } from 'react-icons/fi';

export default function Checkout() {
  const { items, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerName: user?.displayName || '',
    customerPhone: '',
    customerAddress: '',
    paymentMethod: 'cod',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true);
    try {
      const orderId = generateOrderId();
      const shopId = items[0]?.shopId;

      const orderData = {
        orderId,
        shopId,
        customerId: user?.uid || null,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerAddress: form.customerAddress,
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, images: i.images })),
        total: getCartTotal(),
        paymentMethod: form.paymentMethod,
        status: 'pending',
        notes: form.notes,
        createdAt: new Date(),
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      for (const item of items) {
        if (item.stock !== undefined && item.stock !== null) {
          const productRef = doc(db, 'products', item.id);
          const productSnap = await getDocs(query(collection(db, 'products'), where('__name__', '==', item.id)));
          if (!productSnap.empty) {
            const productDoc = productSnap.docs[0];
            const newStock = Math.max(0, (productDoc.data().stock || 0) - item.quantity);
            await updateDoc(productRef, { stock: newStock });
          }
        }
      }

      await addDoc(collection(db, 'notifications'), {
        shopId,
        type: 'new_order',
        message: `New order ${orderId} from ${form.customerName}`,
        isRead: false,
        createdAt: new Date(),
      });

      clearCart();
      navigate(`/customer/order-confirmation/${orderRef.id}`);
      toast.success('Order placed!');
    } catch (err) {
      toast.error(err.message);
      submitting.current = false;
    }
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><FiPackage /> Delivery Details</h2>
          <div>
            <label className="label">Full Name</label>
            <input name="customerName" value={form.customerName} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input name="customerPhone" value={form.customerPhone} onChange={handleChange} className="input-field" required placeholder="10-digit number" />
          </div>
          <div>
            <label className="label">Address</label>
            <textarea name="customerAddress" value={form.customerAddress} onChange={handleChange} className="input-field" rows={3} />
          </div>
          <h2 className="text-lg font-semibold flex items-center gap-2 mt-4"><FiCreditCard /> Payment Method</h2>
          <div className="space-y-2">
            {PAYMENT_METHODS.map(m => (
              <label key={m.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="paymentMethod" value={m.value} checked={form.paymentMethod === m.value} onChange={handleChange} className="text-indigo-600" />
                <span>{m.label}</span>
              </label>
            ))}
          </div>
          <div>
            <label className="label">Order Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="input-field" rows={2} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full text-lg">
            {loading ? 'Placing Order...' : `Place Order - ${formatCurrency(getCartTotal())}`}
          </button>
        </form>

        <div className="card h-fit">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(getCartTotal())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
