import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import ImageUploader from '../../components/common/ImageUploader';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import ShareButtons from '../../components/common/ShareButtons';
import Loading from '../../components/common/Loading';

export default function ShopSettings() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    async function load() {
      if (!user?.shopId) return;
      const snap = await getDoc(doc(db, 'shops', user.shopId));
      if (snap.exists()) {
        setShop({ id: snap.id, ...snap.data() });
        setForm(snap.data());
      }
      setLoading(false);
    }
    load();
  }, [user?.shopId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'shops', user.shopId), { ...form, updatedAt: new Date() });
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.message);
    }
    setSaving(false);
  }

  if (loading) return <Loading />;
  if (!shop) return <p>Shop not found</p>;

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-4 text-sm font-medium">
        <FiArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold mb-6">Shop Settings</h1>

      {shop.slug && (
        <div className="card mb-6 text-center">
          <h2 className="font-semibold mb-3">Shop QR Code</h2>
          <div className="inline-block bg-white p-4 rounded-xl border-2 border-dashed border-gray-200">
            <QRCodeSVG value={`${window.location.origin}/shop/${shop.slug}/auth`} size={160} />
          </div>
          <p className="text-xs text-gray-400 mt-2 break-all">{window.location.origin}/shop/{shop.slug}/auth</p>
          <div className="mt-3 flex justify-center">
            <ShareButtons url={`${window.location.origin}/shop/${shop.slug}/auth`} title={shop.name || 'Shop'} />
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="card space-y-4">
        <div>
          <label className="label">Shop Name</label>
          <input name="name" value={form.name || ''} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" value={form.description || ''} onChange={handleChange} className="input-field" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Phone</label>
            <input name="phone" value={form.phone || ''} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" value={form.email || ''} onChange={handleChange} className="input-field" />
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <input name="address" value={form.address || ''} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="label">Google Maps Link</label>
          <input name="googleMaps" value={form.googleMaps || ''} onChange={handleChange} className="input-field" placeholder="https://maps.google.com/..." />
        </div>
        <div>
          <label className="label">Logo</label>
          <ImageUploader onUpload={(url) => setForm(prev => ({ ...prev, logo: url }))} path={`shops/${user.shopId}/logo`} />
          {form.logo && <img src={form.logo} alt="Logo" className="w-20 h-20 mt-2 rounded-lg object-cover" />}
        </div>
        <div>
          <label className="label">Banner</label>
          <ImageUploader onUpload={(url) => setForm(prev => ({ ...prev, banner: url }))} path={`shops/${user.shopId}/banner`} />
          {form.banner && <img src={form.banner} alt="Banner" className="w-full h-40 mt-2 rounded-lg object-cover" />}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Facebook</label>
            <input name="socialLinks.facebook" value={form.socialLinks?.facebook || ''} onChange={(e) => setForm(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, facebook: e.target.value } }))} className="input-field" />
          </div>
          <div>
            <label className="label">Instagram</label>
            <input name="socialLinks.instagram" value={form.socialLinks?.instagram || ''} onChange={(e) => setForm(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, instagram: e.target.value } }))} className="input-field" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          <FiSave /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
