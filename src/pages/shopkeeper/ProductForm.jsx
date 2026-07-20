import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import useCategories from '../../hooks/useCategories';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import ImageUploader from '../../components/common/ImageUploader';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft, FiPlus } from 'react-icons/fi';

const UNITS = ['Kg', 'G', 'Mg', 'L', 'Ml', 'Pcs', 'Box', 'Pack', 'Dozen', 'Pair', 'Set', 'Bottle', 'Can', 'Bag', 'Roll'];

export default function ProductForm() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { categories } = useCategories(user?.shopId);
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '', description: '', price: '', mrp: '', discount: '', stock: '', categoryId: '',
    brand: '', size: '', unit: 'Pcs', images: [], isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [catSearch, setCatSearch] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [catCreating, setCatCreating] = useState(false);
  const catRef = useRef(null);

  useEffect(() => {
    if (isEdit) {
      getDoc(doc(db, 'products', id)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            ...data,
            price: String(data.price || ''),
            mrp: String(data.mrp || ''),
            discount: String(data.discount || ''),
            stock: String(data.stock ?? ''),
            size: String(data.size || ''),
            unit: data.unit || 'Pcs',
          });
        }
        setFetching(false);
      });
    }
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'mrp' && value) {
        const mrp = parseFloat(value);
        const price = parseFloat(prev.price);
        if (mrp > 0 && price > 0 && price < mrp) {
          updated.discount = String(Math.round(((mrp - price) / mrp) * 100));
        }
      }
      if (name === 'price' && prev.mrp) {
        const mrp = parseFloat(prev.mrp);
        const price = parseFloat(value);
        if (mrp > 0 && price > 0 && price < mrp) {
          updated.discount = String(Math.round(((mrp - price) / mrp) * 100));
        }
      }
      if (name === 'discount' && prev.mrp) {
        const mrp = parseFloat(prev.mrp);
        const disc = parseFloat(value);
        if (mrp > 0 && disc >= 0 && disc <= 100) {
          updated.price = String(Math.round(mrp - (mrp * disc) / 100));
        }
      }
      return updated;
    });
  }

  const filteredCategories = categories.filter(c => c.name?.toLowerCase().includes(catSearch.toLowerCase()));
  const selectedCategory = categories.find(c => c.id === form.categoryId);

  async function handleAddCategory() {
    if (!catSearch.trim()) return;
    setCatCreating(true);
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        name: catSearch.trim(),
        shopId: user.shopId,
        createdAt: new Date(),
      });
      setForm(prev => ({ ...prev, categoryId: docRef.id }));
      setCatSearch('');
      setCatOpen(false);
      toast.success('Category created');
    } catch (err) {
      toast.error(err.message);
    }
    setCatCreating(false);
  }

  function selectCategory(cat) {
    setForm(prev => ({ ...prev, categoryId: cat.id }));
    setCatSearch('');
    setCatOpen(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price) || 0,
        mrp: parseFloat(form.mrp) || 0,
        discount: parseFloat(form.discount) || 0,
        stock: form.stock ? parseInt(form.stock) : null,
        size: form.size || null,
        unit: form.unit,
        shopId: user.shopId,
        updatedAt: new Date(),
      };
      if (isEdit) {
        await updateDoc(doc(db, 'products', id), data);
        toast.success('Product updated');
      } else {
        data.createdAt = new Date();
        await addDoc(collection(db, 'products'), data);
        toast.success('Product added');
      }
      navigate(`/shop/${slug}/dashboard/products`);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  }

  if (fetching) return <div className="card">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><FiArrowLeft /></button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      </div>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Product Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="input-field" rows={3} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Brand</label>
            <input name="brand" value={form.brand} onChange={handleChange} className="input-field" placeholder="e.g. Nike, Samsung" />
          </div>
          <div>
            <label className="label">Category</label>
            <div className="relative" ref={catRef}>
              <input
                type="text"
                className="input-field"
                placeholder="Type to search or add..."
                value={catSearch || (selectedCategory ? selectedCategory.name : '')}
                onChange={(e) => { setCatSearch(e.target.value); setCatOpen(true); }}
                onFocus={() => { if (selectedCategory) setCatSearch(''); setCatOpen(true); }}
                onBlur={() => setTimeout(() => setCatOpen(false), 200)}
              />
              {form.categoryId && (
                <button type="button" onClick={() => { setForm(prev => ({ ...prev, categoryId: '' })); setCatSearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">Clear</button>
              )}
              {catOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredCategories.map(c => (
                    <button key={c.id} type="button" onMouseDown={() => selectCategory(c)} className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 ${c.id === form.categoryId ? 'bg-indigo-100 font-medium' : ''}`}>
                      {c.name}
                    </button>
                  ))}
                  {catSearch.trim() && !filteredCategories.some(c => c.name?.toLowerCase() === catSearch.toLowerCase()) && (
                    <button type="button" onMouseDown={handleAddCategory} disabled={catCreating} className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 border-t flex items-center gap-2">
                      <FiPlus className="w-4 h-4" />
                      {catCreating ? 'Creating...' : `Add "${catSearch.trim()}"`}
                    </button>
                  )}
                  {filteredCategories.length === 0 && !catSearch.trim() && (
                    <div className="px-3 py-2 text-sm text-gray-400">Start typing to search or add a category</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Size</label>
            <input name="size" value={form.size} onChange={handleChange} className="input-field" placeholder="e.g. 500, XL" />
          </div>
          <div>
            <label className="label">Unit</label>
            <select name="unit" value={form.unit} onChange={handleChange} className="input-field">
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Stock</label>
            <input name="stock" type="number" value={form.stock} onChange={handleChange} className="input-field" placeholder="Blank = unlimited" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">MRP (₹)</label>
            <input name="mrp" type="number" step="0.01" value={form.mrp} onChange={handleChange} className="input-field" placeholder="Original price" />
          </div>
          <div>
            <label className="label">Selling Price (₹)</label>
            <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="label">Discount (%)</label>
            <input name="discount" type="number" min="0" max="100" value={form.discount} onChange={handleChange} className="input-field" placeholder="Auto-calculated" />
          </div>
        </div>
        {form.mrp && form.price && parseFloat(form.mrp) > parseFloat(form.price) && (
          <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg">
            You save {formatCurrency(form.mrp - form.price)} ({form.discount}% off)
          </div>
        )}
        <div>
          <label className="label">Images</label>
          <ImageUploader onUpload={(urls) => setForm(prev => ({ ...prev, images: urls ? (Array.isArray(urls) ? urls : [urls]) : [] }))} path={`products/${user.shopId}`} multiple />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="active" checked={form.isActive} onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))} className="rounded" />
          <label htmlFor="active" className="text-sm">Active</label>
        </div>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          <FiSave /> {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
}
