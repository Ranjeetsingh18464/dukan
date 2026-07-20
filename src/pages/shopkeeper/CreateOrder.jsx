import { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import useProducts from '../../hooks/useProducts';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { PAYMENT_METHODS } from '../../utils/constants';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft, FiPlus, FiTrash2, FiPrinter } from 'react-icons/fi';
import ShopHeader from '../../components/common/ShopHeader';

export default function CreateOrder() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { user } = useContext(AuthContext);
  const { products } = useProducts(user?.shopId);
  const [loading, setLoading] = useState(false);
  const [purchaseOrderNum, setPurchaseOrderNum] = useState('');
  const [form, setForm] = useState({
    vendorName: '', vendorPhone: '', vendorEmail: '', address: '',
    paymentMethod: 'cod', notes: '',
  });
  const [items, setItems] = useState([{ productId: '', name: '', price: 0, quantity: 1 }]);
  const [shop, setShop] = useState(null);

  useEffect(() => {
    if (!user?.shopId) return;
    (async () => {
      const snap = await getDocs(query(collection(db, 'orders'), where('shopId', '==', user.shopId), where('type', '==', 'purchase')));
      setPurchaseOrderNum(String(snap.size + 1));
      const shopSnap = await getDoc(doc(db, 'shops', user.shopId));
      if (shopSnap.exists()) setShop({ id: shopSnap.id, ...shopSnap.data() });
    })();
  }, [user?.shopId]);

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function addItem() {
    setItems(prev => [...prev, { productId: '', name: '', price: 0, quantity: 1 }]);
  }

  function removeItem(i) {
    setItems(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleItemChange(i, field, value) {
    setItems(prev => prev.map((item, idx) => {
      if (idx !== i) return item;
      const updated = { ...item, [field]: value };
      if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
          updated.name = product.name;
          updated.price = product.price || 0;
        }
      }
      if (field === 'quantity') {
        updated.quantity = parseInt(value) || 1;
      }
      return updated;
    }));
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function handlePrint() {
    const validItems = items.filter(i => i.productId);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>Purchase Order</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .meta { font-size: 13px; color: #444; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #ccc; padding: 8px 10px; text-align: left; font-size: 13px; }
        th { background: #f0f0f0; }
        .total-row td { font-weight: bold; font-size: 15px; border-top: 2px solid #000; }
        .right { text-align: right; }
        .section { margin-bottom: 14px; font-size: 13px; }
        .section span { display: inline-block; min-width: 120px; font-weight: 600; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <h1>PURCHASE ORDER</h1>
      <div style="text-align:center;border-bottom:2px solid #333;padding-bottom:10px;margin-bottom:16px;">
        <h2>${shop?.name || 'Shop'}</h2>
        <p>${shop?.address || ''}</p>
        <p>${shop?.phone || ''}</p>
      </div>
      <div class="meta">Order No ${purchaseOrderNum} &nbsp;|&nbsp; Date: ${new Date().toLocaleDateString()}</div>
      <div class="section">
        <div><span>Vendor:</span> ${form.vendorName || '—'}</div>
        <div><span>Phone:</span> ${form.vendorPhone || '—'}</div>
        <div><span>Email:</span> ${form.vendorEmail || '—'}</div>
        <div><span>Address:</span> ${form.address || '—'}</div>
        <div><span>Payment:</span> ${form.paymentMethod.toUpperCase()}</div>
        ${form.notes ? `<div><span>Notes:</span> ${form.notes}</div>` : ''}
      </div>
      <table>
        <thead><tr><th>#</th><th>Product</th><th class="right">Qty</th></tr></thead>
        <tbody>
          ${validItems.map((item, i) => `<tr><td>${i + 1}</td><td>${item.name}</td><td class="right">${item.quantity}</td></tr>`).join('')}
        </tbody>
      </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.vendorName.trim()) {
      toast.error('Vendor name is required');
      return;
    }
    const validItems = items.filter(i => i.productId);
    if (validItems.length === 0) {
      toast.error('Add at least one product');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        orderId: `Order No ${purchaseOrderNum}`,
        shopId: user.shopId,
        type: 'purchase',
        vendorName: form.vendorName,
        vendorPhone: form.vendorPhone,
        vendorEmail: form.vendorEmail,
        address: form.address,
        paymentMethod: form.paymentMethod,
        notes: form.notes,
        items: validItems.map(i => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          total: i.price * i.quantity,
        })),
        subtotal,
        total: subtotal,
        status: 'pending',
        createdAt: new Date(),
      };
      await addDoc(collection(db, 'orders'), orderData);
      toast.success('Purchase order created');
      navigate(`/shop/${slug}/dashboard/purchase-orders`);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><FiArrowLeft /></button>
        <h1 className="text-xl sm:text-2xl font-bold">Create Purchase Order</h1>
        <span className="text-sm text-gray-500 ml-auto font-medium">Order No <input type="text" value={purchaseOrderNum} onChange={(e) => setPurchaseOrderNum(e.target.value)} className="w-16 text-center border-b border-gray-300 focus:border-indigo-500 outline-none font-medium text-gray-700" /></span>
        <span className="text-sm text-gray-500 hidden sm:inline">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ShopHeader />
        <div className="card">
          <h2 className="font-semibold mb-3">Vendor Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Vendor Name</label>
              <input name="vendorName" value={form.vendorName} onChange={handleFormChange} className="input-field" required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="vendorPhone" value={form.vendorPhone} onChange={handleFormChange} className="input-field" />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="vendorEmail" type="email" value={form.vendorEmail} onChange={handleFormChange} className="input-field" />
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select name="paymentMethod" value={form.paymentMethod} onChange={handleFormChange} className="input-field">
                {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Address</label>
            <textarea name="address" value={form.address} onChange={handleFormChange} className="input-field" rows={2} />
          </div>
          <div className="mt-4">
            <label className="label">Notes</label>
            <input name="notes" value={form.notes} onChange={handleFormChange} className="input-field" placeholder="Optional" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Items</h2>
            <button type="button" onClick={addItem} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"><FiPlus /> Add Item</button>
          </div>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex gap-3 items-end">
                <div className="flex-1">
                  {i === 0 && <label className="label">Product</label>}
                  <select value={item.productId} onChange={(e) => handleItemChange(i, 'productId', e.target.value)} className="input-field" required>
                    <option value="">Select product</option>
                    {products.filter(p => p.isActive !== false).map(p => (
                      <option key={p.id} value={p.id}>{p.name}{p.size ? ` (${p.size} ${p.unit})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  {i === 0 && <label className="label">Qty</label>}
                  <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(i, 'quantity', e.target.value)} className="input-field" required />
                </div>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 /></button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <FiSave /> {loading ? 'Creating...' : 'Create Purchase Order'}
          </button>
          <button type="button" onClick={handlePrint} className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center gap-2 font-medium">
            <FiPrinter /> Print
          </button>
        </div>
      </form>
    </div>
  );
}
