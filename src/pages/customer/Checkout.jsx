import { useState, useContext, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatCurrency, generateOrderId } from '../../utils/helpers';
import { PAYMENT_METHODS } from '../../utils/constants';
import toast from 'react-hot-toast';
import { FiCreditCard, FiMapPin, FiPackage, FiArrowLeft, FiCheck, FiShoppingBag } from 'react-icons/fi';

export default function Checkout() {
  const { slug } = useParams();
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
      navigate(`/shop/${slug}/order-confirmation/${orderRef.id}`);
      toast.success('Order placed!');
    } catch (err) {
      toast.error(err.message);
      submitting.current = false;
    }
    setLoading(false);
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-500 mb-2">Cart is empty</h2>
        <p className="text-gray-400 text-sm mb-6">Add some products before checking out</p>
        <Link to="/customer/shops" className="btn-primary inline-flex items-center gap-2">
          <FiShoppingBag className="w-4 h-4" /> Browse Shops
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-4 text-sm font-medium transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold mb-6 animate-slide-up">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-3 card space-y-5 animate-slide-up animate-slide-up-delay-1">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center"><FiPackage className="w-4 h-4 text-indigo-600" /></div>
            Delivery Details
          </h2>
          <div>
            <label className="label">Full Name</label>
            <input name="customerName" value={form.customerName} onChange={handleChange} className="input-field" required placeholder="Your full name" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input name="customerPhone" value={form.customerPhone} onChange={handleChange} className="input-field" required placeholder="10-digit phone number" />
          </div>
          <div>
            <label className="label">Delivery Address</label>
            <textarea name="customerAddress" value={form.customerAddress} onChange={handleChange} className="input-field" rows={3} placeholder="Full delivery address" />
          </div>

          <h2 className="text-lg font-semibold flex items-center gap-2 pt-2">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center"><FiCreditCard className="w-4 h-4 text-indigo-600" /></div>
            Payment Method
          </h2>
          <div className="space-y-2">
            {PAYMENT_METHODS.map(m => (
              <label key={m.value} className={`flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all ${form.paymentMethod === m.value ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.paymentMethod === m.value ? 'border-indigo-500' : 'border-gray-300'}`}>
                  {form.paymentMethod === m.value && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                </div>
                <span className="font-medium text-sm">{m.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="label">Order Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="input-field" rows={2} placeholder="Any special instructions..." />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3 flex items-center justify-center gap-2">
            {loading ? (
              <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Placing Order...</span>
            ) : (
              <><FiCheck className="w-5 h-5" /> Place Order — {formatCurrency(getCartTotal())}</>
            )}
          </button>
        </form>

        <div className="lg:col-span-2 space-y-6">
          <div className="card h-fit animate-slide-up animate-slide-up-delay-2">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.images?.[0] || ''} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(getCartTotal())}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-3">
                <span>Total</span>
                <span className="text-indigo-600">{formatCurrency(getCartTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
