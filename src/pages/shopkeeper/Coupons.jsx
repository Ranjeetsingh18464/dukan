import { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import useCategories from '../../hooks/useCategories';
import { collection, addDoc, doc, deleteDoc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatDate } from '../../utils/helpers';
import Modal from '../../components/common/Modal';
import Empty from '../../components/common/Empty';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

export default function Coupons() {
  const { user } = useContext(AuthContext);
  const [coupons, setCoupons] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ code: '', discount: '', type: 'percentage', minOrder: '', expiry: '', isActive: true });
  const [saving, setSaving] = useState(false);

  useState(() => {
    const unsub = onSnapshot(query(collection(db, 'coupons'), where('shopId', '==', user?.shopId)), (snap) => {
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user?.shopId]);

  function openCreate() {
    setEditId(null);
    setForm({ code: '', discount: '', type: 'percentage', minOrder: '', expiry: '', isActive: true });
    setModalOpen(true);
  }

  function openEdit(coupon) {
    setEditId(coupon.id);
    setForm(coupon);
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, shopId: user.shopId, discount: parseFloat(form.discount) || 0, minOrder: parseFloat(form.minOrder) || 0 };
      if (editId) {
        await updateDoc(doc(db, 'coupons', editId), data);
        toast.success('Coupon updated');
      } else {
        data.createdAt = new Date();
        data.isActive = true;
        await addDoc(collection(db, 'coupons'), data);
        toast.success('Coupon created');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
    setSaving(false);
  }

  async function toggleCoupon(id, isActive) {
    await updateDoc(doc(db, 'coupons', id), { isActive: !isActive });
    toast.success('Coupon updated');
  }

  async function deleteCoupon(id) {
    if (!confirm('Delete coupon?')) return;
    await deleteDoc(doc(db, 'coupons', id));
    toast.success('Coupon deleted');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><FiPlus /> Add Coupon</button>
      </div>
      {coupons.length === 0 ? (
        <Empty message="No coupons yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Code</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Discount</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Min Order</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                  <td className="px-4 py-3">{c.type === 'percentage' ? `${c.discount}%` : `₹${c.discount}`}</td>
                  <td className="px-4 py-3">₹{c.minOrder || 0}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleCoupon(c.id, c.isActive)} className={`flex items-center gap-1 text-sm ${c.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                      {c.isActive ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="p-2 hover:bg-gray-100 rounded-lg text-indigo-600"><FiEdit /></button>
                      <button onClick={() => deleteCoupon(c.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Coupon' : 'Add Coupon'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Code</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field font-mono" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select>
            </div>
            <div>
              <label className="label">Discount</label>
              <input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="label">Min Order (₹)</label>
            <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label">Expiry Date</label>
            <input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} className="input-field" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
        </form>
      </Modal>
    </div>
  );
}
