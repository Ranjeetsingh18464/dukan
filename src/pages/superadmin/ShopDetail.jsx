import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatDate } from '../../utils/helpers';
import { QRCodeSVG } from 'qrcode.react';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import { FiSave, FiExternalLink } from 'react-icons/fi';

export default function ShopDetail() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'shops', id));
      if (snap.exists()) {
        setShop({ id: snap.id, ...snap.data() });
        setForm(snap.data());
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSave() {
    await updateDoc(doc(db, 'shops', id), form);
    toast.success('Shop updated');
  }

  if (loading) return <Loading />;
  if (!shop) return <p>Shop not found</p>;

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">{shop.name}</h1>
        <div className="flex gap-2">
          <Link to={`/shop/${shop.slug}`} target="_blank" className="btn-secondary flex items-center gap-2"><FiExternalLink /> View Shop</Link>
          <button onClick={handleSave} className="btn-primary flex items-center gap-2"><FiSave /> Save</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card space-y-4">
          <div>
            <label className="label">Shop Name</label>
            <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label">Slug</label>
            <input value={form.slug || ''} className="input-field bg-gray-50" readOnly />
          </div>
          <div>
            <label className="label">Phone</label>
            <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label">Address</label>
            <input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} />
          </div>
          <p className="text-sm text-gray-500">Created: {formatDate(shop.createdAt)}</p>
        </div>
        <div className="card flex flex-col items-center gap-4">
          <h3 className="font-semibold">Shop QR Code</h3>
          <QRCodeSVG value={`${window.location.origin}/shop/${shop.slug}`} size={160} />
          <p className="text-sm text-gray-500">{shop.slug}</p>
        </div>
      </div>
    </div>
  );
}
