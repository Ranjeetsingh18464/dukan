import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { slugify } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';

export default function CreateShop() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ shopName: '', shopSlug: '', email: '', phone: '', address: '', description: '' });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'shopName') updated.shopSlug = slugify(value);
      return updated;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const existing = await getDocs(query(collection(db, 'shops'), where('ownerEmail', '==', form.email)));
      if (!existing.empty) {
        toast.error('A shop already exists with this email');
        setLoading(false);
        return;
      }

      const slugCheck = await getDocs(query(collection(db, 'shops'), where('slug', '==', form.shopSlug)));
      if (!slugCheck.empty) {
        toast.error('Shop URL already taken');
        setLoading(false);
        return;
      }

      const docRef = await addDoc(collection(db, 'shops'), {
        name: form.shopName,
        slug: form.shopSlug,
        ownerEmail: form.email,
        phone: form.phone,
        address: form.address,
        description: form.description,
        isActive: true,
        createdAt: new Date(),
      });

      console.log('Shop created with ID:', docRef.id);

      const verifySnap = await getDocs(query(collection(db, 'shops'), where('slug', '==', form.shopSlug)));
      console.log('Verify read back:', verifySnap.size, 'docs');

      toast.success('Shop created! ID: ' + docRef.id);
      setTimeout(() => navigate('/admin/shops'), 500);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Create New Shop</h1>
      <p className="text-sm text-gray-500 mb-6">The shopkeeper will register themselves using the email below. After registering, they'll be auto-linked to this shop.</p>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Shop Name</label>
          <input name="shopName" value={form.shopName} onChange={handleChange} className="input-field" required />
        </div>
        <div>
          <label className="label">Shop URL Slug</label>
          <input name="shopSlug" value={form.shopSlug} onChange={handleChange} className="input-field bg-gray-50" readOnly />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Shopkeeper Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <input name="address" value={form.address} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="input-field" rows={3} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          <FiSave /> {loading ? 'Creating...' : 'Create Shop'}
        </button>
      </form>
    </div>
  );
}
