import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';
import { FiEdit3, FiSave, FiX } from 'react-icons/fi';

export default function ShopHeader() {
  const { user } = useContext(AuthContext);
  const [shop, setShop] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });

  useEffect(() => {
    if (!user?.shopId) return;
    getDoc(doc(db, 'shops', user.shopId)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setShop({ id: snap.id, ...data });
        setForm({ name: data.name || '', address: data.address || '', phone: data.phone || '' });
      }
    });
  }, [user?.shopId]);

  async function handleSave() {
    try {
      await updateDoc(doc(db, 'shops', user.shopId), { ...form, updatedAt: new Date() });
      setShop(prev => ({ ...prev, ...form }));
      setEditing(false);
      toast.success('Shop details updated');
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (!shop) return null;

  return (
    <div className="card mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {shop.logo && <img src={shop.logo} alt="" className="w-12 h-12 rounded-lg object-cover" />}
          <div>
            {editing ? (
              <input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} className="input-field text-lg font-bold mb-1" placeholder="Shop name" />
            ) : (
              <h2 className="text-lg font-bold">{shop.name}</h2>
            )}
            {editing ? (
              <input value={form.address} onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))} className="input-field text-sm" placeholder="Address" />
            ) : (
              <p className="text-sm text-gray-500">{shop.address || 'No address set'}</p>
            )}
            {!editing && shop.phone && <p className="text-xs text-gray-400 mt-0.5">{shop.phone}</p>}
          </div>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <button type="button" onClick={handleSave} className="p-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><FiSave className="w-4 h-4" /></button>
            <button type="button" onClick={() => { setEditing(false); setForm({ name: shop.name || '', address: shop.address || '', phone: shop.phone || '' }); }} className="p-2.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"><FiX className="w-4 h-4" /></button>
          </div>
        ) : (
          <button type="button" onClick={() => setEditing(true)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"><FiEdit3 className="w-4 h-4" /></button>
        )}
      </div>
    </div>
  );
}
